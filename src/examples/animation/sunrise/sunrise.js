/*  Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.stanley.kay AT gmail.com
 December 21, 2009

 To render the teapot, SceneJS will traverse the scene in depth-first
 order. Each node is a function that will set some WebGL state on entry,
 then un-set it again before exit. In this graph, a renderer activates a
 Canvas element, a shader activates some GLSL scripts, and the rest of
 the nodes set various matrices, vectors and geometry variables within
 the scripts. Note that node declarations generally have the form
 node({configs}, child,child...). For brevity, node configurations need
 only specify values where defaults are overridden, such as non-zero
 vector components, for example.
 */
with (SceneJs) {

    var exampleScene = scene(
    {},

        /* A renderer node binds this scene to a WebGL canvas element
         defined in the HTML tab
         */
            renderer({
                canvasId: 'theCanvas',
                clearColor : { r:0, g:0, b:0.0, a: 1 },
                viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                clear : { depth : true, color : true}
            },
                /* A simple phong GLSL shader to render sub-nodes, with
                 a single light source. This shader type only supports
                 a one light source.
                 */
                    shader(
                    { type: 'simple-shader' },


                        /* Perspective transformation
                         */
                            perspective(
                            {  fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0 },

                                /* Viewing transform specifies eye position, looking
                                 at the origin by default
                                 */
                                    lookAt(
                                    {
                                        eye : { x: 0.0, y: 10.0, z: -15 },
                                        up : { y: 1.0 }
                                    },

                                            lights(function(scope) {
                                                return {
                                                    lights: [
                                                        {
                                                            pos: { x: 0, y: scope.get("lightY"), z: 0 }
                                                        }
                                                    ]};
                                            },
                                                /* Next, a modelling transform to orient our teapot
                                                 by a given angle.  See how this node takes a function
                                                 which creates its configuration object?  You can do
                                                 that when you want a node's configuration to be
                                                 evaluated dynamically at traversal-time. The function
                                                 takes a scope, which is SceneJS's mechanism for passing
                                                 variables down into a scene graph. Using the angle
                                                 variable on the scope, the function creates a
                                                 configuration that specifies a rotation about the X-axis.
                                                 Further down you'll see how we inject that angle
                                                 variable when we render the scene.
                                                 */
                                                    rotate(function(scope) {
                                                        return {
                                                            angle: scope.get('angle'), y : 1.0
                                                        };
                                                    },

                                                        /* Make our teapot nice and shiney
                                                         */
                                                            material({
                                                                ambient:  { r:0.2, g:0.2, b:0.5 },
                                                                diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                            },
                                                                /* Teapot's geometry
                                                                 */
                                                                    objects.teapot()
                                                                    )
                                                            ) // rotate
                                                    ) // lookAt
                                            ) // frustum
                                    )
                            ) // shader                            
                    ) // renderer
            ); // scene

    var alpha = 0;
    var pInterval;

    function doit() {
        if (alpha > 180) {
            exampleScene.destroy();
            clearInterval(pInterval);
        }

        alpha += 0.1;
        try {
            exampleScene.render({lightY: alpha, angle: 45});
        } catch (e) {
            if (e.message) {
                alert(e.message);
            } else {
                alert(e);
            }
            throw e;
        }
    }

    /* Hack to get any scene definition exceptions up front.
     * Chrome seemed to absorb them in setInterval!
     */
    exampleScene.render({lightAngle: alpha, angle: 45});

    /* Continue animation
     */
    pInterval = setInterval("doit()", 10);
}