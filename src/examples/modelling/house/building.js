function box(cfg) {
    with (SceneJS) {
        return material({
            ambient:  { r:0.2, g:0.2, b:0.5 },
            diffuse:  { r:0.6, g:0.6, b:0.9 }
        },
                translate({ x: cfg.xpos || 0, y: cfg.ypos || 0, z: cfg.zpos || 0 },
                        scale({ x: cfg.xsize || 1, y: cfg.ysize || 1, z: cfg.zsize || 1},
                                objects.cube())));
    }
}

with (SceneJS) {
    var exampleScene = scene({}, // node always has a config object

            renderer({
                canvasId: 'theCanvas',
                clearColor : { r:0, g:0, b:0.0, a: 1 },
                viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                clear : { depth : true, color : true}
            },

                    shader({ type: 'simple-shader' },

                            lights({
                                sources: [
                                    {
                                        pos: { x: 50.0, y: 20.0, z: -300.0 }
                                    }
                                ]},
                                    perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 30000.0
                                    },
                                            lookAt({
                                                eye : { x: 0.0, y: 20, z: -200.0},
                                                look : { x : 0.0, y : 0.0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }
                                            },
                                                    box({ xsize: 100.0, zsize:100, ypos: 30})   ,
                                                    box({ xsize: 100.0, zsize:100, ypos: 20})   ,
                                                    box({ xsize: 100.0, zsize:100, ypos: 10})
//                                                    ,
//                                                    box({ xpos: -10.0, ypos: -10.0 }),
//                                                    box({ xpos: 10.0, ypos: -10.0 }),
//                                                    box({ xpos: 10.0, ypos: 10.0 }),
//                                                    box({ xpos: -10.0, ypos: 10.0 })

                                                    ) // lookAt


                                            ) // frustum
                                    ) // lights
                            ) // shader
                    ) // renderer
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

