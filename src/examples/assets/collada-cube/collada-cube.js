/**
 * SceneJS Example - Importing a Collada cube into a scene
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * This scene demonstrates how to include an "asset", which is
 * graphics terminology for a piece of scene that exists somewhere
 * in the form of a file. In this case, our asset is a Collada file
 * that describes a simple cube.
 *
 * When first visited, that asset node down there will load a Collada
 * file and magically cause it to become the contents of its subtree.
 *
 * To enable this, we have installed a backend into SceneJS to support
 * parsing of Collada files (identified by their ".dae" extension)
 * into SceneJS scene chuncks. Providing you can write the parser,
 * the file formats you can support are limited only by what SceneJS
 * node types are available, which is of course extensible.
 */
with (SceneJs) {
    var introScene = scene({}, // node always has a config object

            canvas({ canvasId: 'mycanvas'},

                    viewport({ x : 1, y : 1, width: 400, height: 400},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 30.0, y: 30.0, z: 30.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                            },
                                                    lookAt({
                                                        eye : { x: 0.0, y: 15.0, z: -15},
                                                        look : { x : 0.0, y : 0.0, z : 0 },
                                                        up : { x: 0.0, y: 1.0, z: 0.0 }

                                                    },
                                                            material({
                                                                ambient:  { r:0.2, g:0.2, b:0.5 },
                                                                diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                            },
                                                                    asset({
                                                                        location:"http://www.scenejs.com/assets/collada/cube.dae"
                                                                    })
                                                                    ) // material
                                                            ) // lookAt
                                                    ) // perspective
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene

    /* Lets do it - render one frame of the scene frontend.
     */
    introScene.render();

    /* Finished with the scene, so we might as well tell SceneJS to free wharever resources it has allocated for the
     * scene, such as the shader scripts and the vertex buffer objects (VBOs) it created for the teapot geometry.
     */
    introScene.destroy();
}
