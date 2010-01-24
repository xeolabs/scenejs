with (SceneJs) {
    var scene = graph({}, // node always has a config object

            canvas({ canvasId: 'theCanvas'},

                    viewport({ x : 1, y : 1, width: 600, height: 600},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 0.0, y: 5.0, z: -50.0 }
                                            }
                                        ]},

                                            perspective({ fovy : 60.0, aspect : 1.0, near : 0.1, far : 600.0},

                                                    lookAt({
                                                        eye : { x: 5.0, y: 5.0, z: -50.0},
                                                        up : { y: 1.0 }
                                                    },

                                                            material({
                                                                ambient:  { r:0.5, g:0.5, b:0.9 },
                                                                diffuse:  { r:0.5, g:0.5, b:0.9 },
                                                                specular: { r:0.5, g:0.5, b:0.9 }},

                                                                    objects.teapot())
                                                            ) // lookAt
                                                    ) // frustum
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene

    scene.render();
}

