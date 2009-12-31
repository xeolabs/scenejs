/**
 *
 */
with (SceneJs) {
    var scene = graph({}, // node always has a config object

            canvas({ canvasId: 'mycanvas'},

                    viewport({ x : 1, y : 1, width: 700, height: 700},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 50.0, y: 0.0, z: 30.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 30000.0
                                            },

                                                    lookAt(function(scope) {
                                                        return{
                                                            eye : { x: 0.0, y: 0, z: scope.get("z")},
                                                            look : { x : 0.0, y : 0.0, z : 0 },
                                                            up : { x: 0.0, y: 1.0, z: 0.0 }
                                                        };
                                                    },
                                                            material({
                                                                ambient:  { r:0.2, g:0.2, b:0.5 },
                                                                diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                            },
                                                                    generator(
                                                                            (function() {
                                                                                var elems = [];
                                                                                for (var i = 0; i < 25; i++) {
                                                                                    elems.push({
                                                                                        x: (50 * Math.random()) - 25.0,
                                                                                        y: (50 * Math.random()) - 25.0,
                                                                                        z: (500 * Math.random()) - 250.0
                                                                                    });
                                                                                }
                                                                                var j = 0;
                                                                                return function() {
                                                                                    if (j < elems.length) {
                                                                                        return { param: elems[j++] };
                                                                                    } else {
                                                                                        j = 0;
                                                                                    }
                                                                                };
                                                                            })(),
                                                                            translate(function(scope) {
                                                                                return scope.get("param");
                                                                            },
                                                                                    scale(function(scope) {
                                                                                        return {
                                                                                            x:2 ,
                                                                                            y:2,
                                                                                            z:2};
                                                                                    },
                                                                                            objects.teapot()
                                                                                            )
                                                                                    )
                                                                            )
                                                                    )

                                                            ) // lookAt
                                                    ) // frustum
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene
    try {
        var i = -450;
        var p;

        function doit() {
            if (i > 500) {
                clearInterval(p);
            }

            i += 2.0;
            scene.render({z:i});
        }
        p = setInterval("doit()", 10);

    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }
}

