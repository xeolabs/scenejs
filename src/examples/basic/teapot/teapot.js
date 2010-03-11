/*  Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.stanley.kay AT gmail.com
 December 21, 2009

 To render the teapot, SceneJS will traverse the scene in depth-first
 order. Each node is a function that will set some WebGL state on entry,
 then un-set it again before exit. In this graph, a canvas activates a
 Canvas element, a default shader is implicitely activated, then the rest of
 the nodes set various matrices, vectors and geometry variables within
 the shader. Note that node declarations generally have the form
 node({configs}, child,child...). For brevity, node configurations need
 only specify values where defaults are overridden, such as non-zero
 vector components, for example.
 */
var exampleScene = SceneJS.scene(

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node binds subnodes to a WebGL canvas element
             defined in the HTML tab then clears the depth and colour buffers
             */
                SceneJS.renderer({
                    canvasId: 'theCanvas',
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.2, g: 0.2, b: 0.2 }
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0 },

                            /* Viewing transform specifies eye position, looking
                             at the origin by default
                             */
                                SceneJS.lookAt({
                                    eye : { x: 0.0, y: 10.0, z: -15 },
                                    look : { y:1.0 },
                                    up : { y: 1.0 }
                                },

                                    /* A lights node inserts  point lights into the world-space.
                                     * You can have many of these, nested within modelling transforms
                                     * if you want to move them around.
                                     */
                                        SceneJS.lights({
                                            lights: [
                                                {
                                                    type:"point",
                                                    color: {r: 0.2, g: 0.2, b: 0.7 },
                                                    pos: { x: -30.0, y: 30.0, z: 30.0 },
                                                    specular: false,
                                                    diffuse: true
                                                }
                                                ,
                                                {
                                                    type:"point",
                                                    color: {r: 1.0, g: 1.0, b: 1.0 },
                                                    pos: { x: 20.0, y: 0.0, z: 30.0 } ,
                                                    specular: false,
                                                    diffuse: true
                                                }
                                                    ,
                                                {
                                                    type:"point",
                                                    color: {r: 1.0, g: .4, b: .4 },
                                                    pos: { x: 20.0, y: -100.0, z: 100.0 } ,
                                                    quadraticAttenuation: 0.01,
                                                    specular: false,
                                                    diffuse: true
                                                }
                                            ]},

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
                                                SceneJS.rotate(function(scope) {
                                                    return {
                                                        angle: scope.get('angle'), y : 1.0
                                                    };
                                                },

                                                    /* Make our teapot blue and shiney
                                                     */
                                                        SceneJS.material({
                                                            color:  { r:0.4, g:0.4, b:0.9 },
                                                            specularColor: { r: 0.2, g: .7, b: .8 }

                                                        },

                                                            /* Teapot's geometry
                                                             */
                                                                SceneJS.objects.teapot()
                                                                )
                                                        ) // rotate
                                                ) // lookAt
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // logging
        ); // scene

/* Throw the switch, Igor!
 * We render the scene, injecting the angle for the rotate node.
 */
exampleScene.render({angle: 45.0});

/* As soon as we are finished with a scene, we should destroy it to to
 * release all the resources (shaders, VBOs etc.) that SceneJS is
 * managing for it. This is critical for the PlayRoom examples since
 * they are re-evaluated each time you hit that Run button - SceneJS
 * will get really confused if you remove this.
 */
exampleScene.destroy();

