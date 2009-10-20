/** Four teapots of various colours
 *
 */
with (SceneJs) {

    var scene = graph(

            canvas({ canvasId: 'mycanvas'},

                    shaders.simpleShader(

                            lights({
                                lights: [
                                    {
                                        pos: { x: 0.0, y: 50.0, z: -50.0 }
                                    }
                                ]},
                                    viewport({
                                        x : 1,
                                        y : 1,
                                        width: 600,
                                        height: 400},

                                            perspective({
                                                fovy : 60.0,
                                                aspect : 6 / 4,
                                                near : 0.1,
                                                far : 400.0},

                                                    lookAt({
                                                        eye : { x: 6.0, y: 6.0, z: -8.0 },
                                                        up : { y: 1.0 }},

                                                            material({ diffuse: { r:0.2, g:0.2, b:0.8 } },
                                                                    translate({ x: -3, z : -3},
                                                                            objects.teapot())),

                                                            material({ diffuse: { r:0.2, g:0.8, b:0.2 } },
                                                                    translate({ x:  3, z : -3},
                                                                            objects.teapot())),

                                                            material({ diffuse: { r:0.8, g:0.2, b:0.2 } },
                                                                    translate({ x:  3, z :  3},
                                                                            objects.teapot())),

                                                            material({ diffuse: { r:0.5, g:0.5, b:0.2 } },
                                                                    translate({ x: -3, z :  3},
                                                                            objects.teapot())))
                                                    ) // perspective
                                            ) // viewport
                                    ) // lights
                            ) // smoothShader
                    ) // canvas
            ); // graph

    scene.traverse();
}

