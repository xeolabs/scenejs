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
                    clearColor: { r:0.0, g: 0.0, b: 0.0 }
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

                                                /* Global ambient colour is taken from the canvas clear colour.
                                                 */
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: 100.0, y: 0.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: -100.0, y: 100.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                }

////                                                ,
//                                                {
//                                                    type:"spot",
//                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
//                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
//                                                    pos:                    { x: 20.0, y: 0.0, z: -20.0 },
//                                                    spotDir:                    { x: -1, y: .0, z: 1.0 },
//                                                    constantAttenuation:    1.0,
//                                                    quadraticAttenuation:   0.0,
//                                                    linearAttenuation:      0.0,
//                                                    spotCosCutOff: 30.0 ,
//                                                    spotExponent: 20
//                                                }

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

                                                    /* Specify the amounts of ambient, diffuse and specular
                                                     * lights our teapot reflects
                                                     */
                                                        SceneJS.material({
                                                            ambient:   { r: 0.5, g: 0.5, b: 0.5 },
                                                            diffuse:   { r: 0.6, g: 0.6, b: 0.6 },
                                                            specular:  { r: 1, g: 1, b: 1 },
                                                            emission: { r: 0.02, g: 0.02, b: 0.0 },
                                                            shininess: 6.0
                                                        },

                                                            /* Teapot's geometry
                                                             */
                                                                SceneJS.scale({x:1.3,y:1.2,z:1.2},
                                                                    //SceneJS.objects.sphere({ slices: 120, rings: 120})
                                                                        SceneJS.objects.teapot()
                                                                        )
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
exampleScene.render({angle: 0.0});

/* As soon as we are finished with a scene, we should destroy it to to
 * release all the resources (shaders, VBOs etc.) that SceneJS is
 * managing for it. This is critical for the PlayRoom examples since
 * they are re-evaluated each time you hit that Run button - SceneJS
 * will get really confused if you remove this.
 */
exampleScene.destroy();

