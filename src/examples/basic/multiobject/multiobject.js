/**
 * Introductory SceneJS Example - Multiple objects with multiple materials
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * February 2010
 *
 * This example demonstrates multiple objects each with their own material
 */
with (SceneJs) {
    var introScene = scene({}, // node always has a config object

            renderer({
                canvasId: 'theCanvas',
                clear : { depth : true, color : true}
            },
                    shader({ type: 'simple-shader' },

                            lights({
                                lights: [
                                    {
                                        pos: { x: -30.0, y: 30.0, z: 30.0 }
                                    }
                                ]},
                                    perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                    },
                                            lookat({
                                                eye : { x: 0.0, y: 7.0, z: -35},
                                                look : { x : 0.0, y : 1.0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }

                                            },
                                                    material({
                                                        ambient:  { r:0.5, g:0.1, b:0.1 },
                                                        diffuse:  { r:0.9, g:0.6, b:0.6 }
                                                    },

                                                            translate({ x: -3 },
                                                                    objects.cube()
                                                                    ),


                                                            translate({ x: 0 },
                                                                    objects.sphere({})
                                                                    )
                                                            ),

                                                    material({
                                                        ambient:  { r:0.2, g:0.2, b:0.5 },
                                                        diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                    },

                                                            translate({ x: 3 },
                                                                    objects.teapot()
                                                                    )
                                                            )
                                                    )

                                            )
                                    )
                            )
                    )
            );
    try {
        introScene.render({angle: 45});
    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e.message || e;
    }
    introScene.destroy();
}