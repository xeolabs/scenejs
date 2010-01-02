/**
 *
 */
with (SceneJs) {
    var exampleScene = scene({}, // node always has a config object

            canvas({ canvasId: 'mycanvas'},

                    viewport({ x : 1, y : 1, width: 600, height: 600},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 50.0, y: 0.0, z: 30.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 30000.0
                                            },
                                                    lookAt({
                                                        eye : { x: 0.0, y: 20, z: -30.0},
                                                        look : { x : 0.0, y : 0.0, z : 0 },
                                                        up : { x: 0.0, y: 1.0, z: 0.0 }
                                                    },
                                                            material({
                                                                ambient:  { r:0.2, g:0.2, b:0.5 },
                                                                diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                            },

                                                                /**
                                                                 * Generate a sequence of Y-axis rotations
                                                                 */
                                                                    generator((function() {
                                                                        var angle = 0;
                                                                        return function() {
                                                                            angle += 45.0;
                                                                            if (angle <= 360.0) {
                                                                                return { angle: angle };
                                                                            }
                                                                        };
                                                                    })(),
                                                                            rotate(function(scope) {
                                                                                return { angle : scope.get("angle"), y: 1.0 };
                                                                            },
                                                                                    translate({ x: 8.0},
                                                                                            objects.teapot()
                                                                                            ) // translate
                                                                                    ) // rotate
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
        exampleScene.render();
    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }
}

