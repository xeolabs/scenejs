/**
 *
 */
with (SceneJs) {
    var scene = graph({}, // node always has a config object

            canvas({ canvasId: 'mycanvas'},

                    viewport({ x : 1, y : 1, width: 1000, height: 1000},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 100.0, y: 40.0, z: 0.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 300.0
                                            },

                                                    lookAt({
                                                        eye : { x: 0.0, y: 60.0, z: -25.0},
                                                        look : { x : 0.0, y : 5.0, z : 0 },
                                                        up : { x: 0.0, y: 1.0, z: 0.0 }
                                                    },
                                                            material({
                                                                ambient:  { r:0.4, g:0.2, b:0.2 },
                                                                diffuse:  { r:0.9, g:0.5, b:0.4 }
                                                            },

                                                                /**
                                                                 * Generate a sequence of Y-axis rotations
                                                                 */
                                                                    generator((function() {
                                                                        var angle = 0;
                                                                        var height = -10;
                                                                        return function() {
                                                                            angle += 15.0;
                                                                            height += 1.0;
                                                                            if (angle <= 560.0) {
                                                                                return { angle: angle, height: height };
                                                                            }
                                                                        };
                                                                    })(),
                                                                            rotate(function(scope) {
                                                                                return { angle : scope.get("angle"), y: 1.0 };
                                                                            },
                                                                                    translate(function(scope) {
                                                                                        return { x: 5.0, y : scope.get("height") };
                                                                                    },
                                                                                        /** Slab for step
                                                                                         */
                                                                                            scale({x: 3.0, y: 0.2, z: 1.0},
                                                                                                    objects.cube()
                                                                                                    )
                                                                                            ) // rotate
                                                                                    ) // translate
                                                                            ) // generator
                                                                    ) // material
                                                            ) // lookAt


                                                    ) // frustum
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene
    try {
        scene.render();
    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }
}

