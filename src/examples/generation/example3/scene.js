/**
 * Demonstrates how to use a generator node to render a scene in two viewports
 */
with (SceneJs) {
    var scene = graph({},

            canvas({
                canvasId: 'mycanvas'
            },
                    shader({ type: 'simple-shader' },
                            lights({
                                lights: [
                                    {
                                        pos: { x: 50.0, y: 0.0, z: 30.0 }
                                    }
                                ]},
                                    material({
                                        ambient:  { r:0.2, g:0.2, b:0.5 },
                                        diffuse:  { r:0.6, g:0.6, b:0.9 }
                                    },
                                            perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                            },
                                                    generator((function() {
                                                        var i = 0;
                                                        return function() {
                                                            i++;
                                                            switch (i) {
                                                                case 1: return { viewport: {  x : 1, y : 1,  width: 200, height: 200  } };
                                                                case 2: return { viewport: { x : 250, y : 1,  width: 200, height: 200  } };
                                                                case 3: return { viewport: { x : 250, y : 250,  width: 200, height: 200  } };
                                                                case 4: return { viewport: { x : 1, y : 250,  width: 200, height: 200  } };
                                                                case 5: i = 0;
                                                            }
                                                        };
                                                    })(),
                                                            viewport(function(scope) {
                                                                return scope.get('viewport');
                                                            },
                                                                    lookAt({
                                                                        eye : { x: 0.0, y: 20.0, z: -20.0},
                                                                        look : { x : 0.0, y : 0.0, z : 0 },
                                                                        up : { x: 0.0, y: 1.0, z: 0.0 }
                                                                    },
                                                                            objects.teapot()
                                                                            )
                                                                    )
                                                            )
                                                    )
                                            )
                                    )
                            )
                    )
            ); // scene
    scene.render();
}

