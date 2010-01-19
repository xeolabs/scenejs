/**
 * SceneJS Example - Teapot cluster flythrough
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * In this scene, the viewpoint moves through a randomly-generated
 * cluster of OpenGL teapots. A generator node dynamically instances
 * the cluster - note how the elems array, containing the teapot
 * positions, is memoised in a closure. More info on generators
 * is available in the generator examples. Then we repeatedly render
 * the scene, each time feeding in a scope containing an increasing
 * value for the eye's location on the Z-axis, which is read by the
 * lookat node.
 */
with (SceneJs) {
    var exampleScene = scene({}, // node always has a config object

            canvas({
                canvasId: 'mycanvas',
                clearColor : { r:0, g:0, b:0.3, a: 1 },
                clearDepth : 1.0,
                depthTest : true
            },

                    viewport({ x : 1, y : 1, width: 600, height: 600},
                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 1000.0, y: 1000.0, z: 0.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 1000.0
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
                                                                                for (var i = 0; i < 35; i++) {
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

    var zpos = -450;
    var p;

    function doit() {
        if (zpos > 500) {
            exampleScene.destroy();
            clearInterval(p);
        }

        zpos += 3.0;
        try {
            exampleScene.render({z:(zpos == 0 ? 0.1 : zpos)}); // Don't allow lookat node's 'look' to equal its 'at'
        } catch (e) {
            if (e.message) {
                alert(e.message);
            } else {
                alert(e);
            }
            throw e;
        }
    }

    /* Hack to get any scene definition exceptions up front.
     * Chrome seemed to absorb them in setInterval!
     */
    exampleScene.render({z:zpos});

    /* Continue animation
     */
    pInterval = setInterval("doit()", 10);
}

