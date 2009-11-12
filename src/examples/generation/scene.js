with (SceneJs) {
    var scene = graph({}, // node always has a config object

            canvas({ canvasId: 'mycanvas'},

                    viewport({ x : 1, y : 1, width: 400, height: 400},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 0.0, y: 50.0, z: -50.0 }
                                            }
                                        ]},

                                            frustum({ fovy : 60.0, aspect : 1.0, near : 0.1, far : 400.0},

                                                    lookAt({
                                                        eye : { x: 5.0, y: 5.0, z: -7.0},
                                                        up : { y: 1.0 }
                                                    },

                                                            generator(function() {

                                                                var angle = 0;

                                                                return function() {
                                                                    angle += 5.0;
                                                                    if (angle < 360) {
                                                                        return {
                                                                            angle: angle
                                                                        };
                                                                    }
                                                                };
                                                            },
                                                                    rotate(function(scope) {
                                                                        return {
                                                                            angle: scope.get('angle'), x : 1.0
                                                                        };
                                                                    },
                                                                            translate({ x: 100 },
                                                                                    objects.teapot()
                                                                                    ) // translate
                                                                            ) // rotate
                                                                    ) // loop
                                                            ) // lookAt
                                                    ) // frustum
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene

    scene.render();
}

