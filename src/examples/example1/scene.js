/**
 * This is a simple scene frontend to demonstrate the general idea. A scene frontend basically renders images to
 * one or more OpenGL canvas elements in the browser page. At the core of a scene frontend is at least one set of vertex
 * and fragment shader scripts written in the OpenGL Shader Language (OGSL), while the rest of the scene frontend is
 * essentially for generating things like matrices, geometry etc. and loading them into variables within those scripts.
 *
 * A key thing to bear in mind when looking over this example is that a scene is traversed in depth-first order, during
 * which each node modifies some bit of scene state on pre-visit and undoes it again it on post-visit. Each node
 * therefore only affects those in the subtree beneath it.
 *
 * This example activates a canvas, activates basic OGSL shader scripts on that canvas, then renders a perspective
 * projection of a scaled and rotated instance of the venerable OpenGL teapot to that canvas.
 *
 * Lots of wicked scene features are not demonstrated here, such as animation, event flows, multiple canvases,
 * advanced shaders and so on. I'll show you those in more examples later.
 */
var scene = new SceneJs.graph(

        /* A Canvas node activates a DOM canvas element for its subtree. You can have more
         * than one Canvas node in your scene if you want multiple views of the scene on multiple
         * canvas tags throughout your page (alternatively, you could have multiple ViewPorts on the
         * same Canvas).
         */
        SceneJs.canvas({

            canvasId: 'mycanvas',

            clearColor: new SceneJs.Color(0.8, 0.8, 0.9, 1.0),
            depthTest: true,
            clearDepth: 1.0
        },


                /*
                 * We've configured the backend with a ShaderBackend plugin of type "example-shader-1",
                 * which our Shader activates to provide OpenGL Shading Language scripts to the GL engine.
                 * You can have many Shader nodes in your scene, to activate different shading scripts for different
                 * subtrees.
                 */
                SceneJs.simpleShader( { type: 'example-shader-1',

                    /*
                     * One of our Shader scripts has a light source variable, which we can provide a
                     * value for here. We could also provide values in ScriptVars nodes anywhere
                     * within the Shader's subtree.
                     */
                    vars: {
                        light: {
                            pos: {
                                x: 60.0,
                                y: 60.0,
                                z: -100.0
                            }
                        }
                    },

                    children: [
                        /*
                         * A ViewPort node selects the area of the Canvas that sub nodes will affect
                         */
                        new SceneJs.Viewport({

                            x : 1,
                            y : 1,
                            width: 400,
                            height: 400,

                            children: [

                                /*
                                 * A Pespective node sets up the perspective transform applied to sub nodes.
                                 * Internally, it generates a perspective matrix and loads it into a special
                                 * projection matrix variable in the Shader scripts.
                                 */
                                new SceneJs.Perspective({

                                    fovy : 60.0,
                                    aspect : 1.0,
                                    near : 0.1,
                                    far : 400.0,

                                    children: [
                                        /*
                                         * A LookAt node sets up the model-view transform to apply to sub nodes
                                         * before the perspective transform.
                                         * Internally, it generates a model-view matrix and loads it into
                                         * a special variable in the Shader scripts.
                                         */
                                        new SceneJs.LookAt({

                                            eye : { z: -50.0 },
                                            up : { y: 1.0 },

                                            children: [
                                                new SceneJs.Layer({
                                                    renderMethods: {
                                                        cullBackfaces: false
                                                    },
                                                    children: [

                                                        /* A Rotate node concatenates a rotation transform onto
                                                         * the model-view matrix and reloads the matrix into
                                                         * the Shader scripts
                                                         */
                                                        new SceneJs.Rotate({

                                                            x: 1.0,
                                                            angle: -45.0,

                                                            children: [

                                                                new SceneJs.Rotate({

                                                                    y: 1.0,
                                                                    angle: 45.0,

                                                                    children: [

                                                                        /* A Scale node concatenates a scaling
                                                                         * transformation onto the model-view
                                                                         * matrix and reloads the matrix into the
                                                                         * Shader scripts
                                                                         */
                                                                        new SceneJs.Scale({

                                                                            x: 5.0,
                                                                            y: 5.0,
                                                                            z: 5.0,

                                                                            children: [

                                                                                /* A Teapot node is a specialised
                                                                                 * Geometry node, which loads
                                                                                 * vertices, normals and faces
                                                                                 * for the venerable OpenGL teapot
                                                                                 * into special variables in
                                                                                 * the Shader scripts
                                                                                 */
                                                                                new SceneJs.scene.ux.Teapot()
                                                                            ]
                                                                        }) // SceneJs.Scale
                                                                    ]
                                                                }) // SceneJs.Rotate
                                                            ]
                                                        }) // SceneJs.Rotate
                                                    ]
                                                }) // SceneJs.Layer
                                            ]
                                        }) // SceneJs.LookAt
                                    ]
                                }) // SceneJs.Perspective
                            ]
                        }) // SceneJs.ViewPort
                    ]
                }) // SceneJs.Shader
            ]
        }) // SceneJs.Canvas
    ]
}); // SceneJs.Graph

/* Lets do it - render one frame of the scene frontend. To recap, the canvas tag with ID "example-canvas" will display
 * a perspective projection of a teapot, scaled, rotated a little bit, translated back into the Z-axis and shaded.
 *
 * Note that if your scene frontend was interactive or animated, you would call this method in a loop.
 */
scene.render();

