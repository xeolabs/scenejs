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
with (SceneJS) {
    var exampleScene = scene({}, // node always has a config object

            renderer({
                canvasId: 'theCanvas',
                clearColor : { r:0, g:0, b:0.3, a: 1 },
                viewport: { x:0, y:0, width:1900, height:950 },
                clear : { depth : true, color : true} ,
                depthRange : { near: .5, far: 1500 }
            },
                    shader({ type: 'simple-shader' },

                            lights({
                                lights: [
                                    {
                                        pos: { x: 1000.0, y: 1000.0, z: 0.0 }
                                    }
                                ]},
//                                    perspective({ fovy : 63.0, aspect : 2.0, near : .5, far : 1500.0
//                                    },
                                      frustum({ left:-500, right:500, bottom:-500, top:500, far:1500},

                                        /* Viewing transform
                                         */
                                            lookat(function(scope) {
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
                                                                        for (var i = 0; i < 200; i++) {
                                                                            elems.push({
                                                                                x: (250 * Math.random()) - 125.0,
                                                                                y: (50 * Math.random()) - 25.0,
                                                                                z: (1800 * Math.random()) - 250.0
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
                                                                            scale({ x:2, y:2, z:2 },
                                                                                    axisBoundary({
                                                                                        xmin: -3.4,
                                                                                        ymin: -3.4,
                                                                                        zmin: -3.4,
                                                                                        xmax: 3.4,
                                                                                        ymax: 3.4,
                                                                                        zmax: 3.4 },
                                                                                            objects.teapot()
                                                                                            )
                                                                                    )
                                                                            )
                                                                    )
                                                            )

                                                    )
                                            )

                                    )
                            )
                    )

            ); // scene

    var zpos = -450;
    var p;

    function handleError(e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }

    function doit() {
        if (zpos > 1500) {
            exampleScene.destroy();
            clearInterval(p);
        }

        zpos += 10.0;
        try {
                 SceneJS.numTeapots=0;
            exampleScene.render({z:(zpos == 0 ? 0.1 : zpos)}); // Don't allow lookat node's 'look' to equal its 'at'
            alert(SceneJS.numTeapots);
        } catch (e) {
            clearInterval(p);
            handleError(e);
        }
    }

    /* Hack to get any scene definition exceptions up front.
     * Chrome seemed to absorb them in setInterval!
     */
  //  try {
     SceneJS.numTeapots=0;
        exampleScene.render({z:zpos});

        /* Continue animation
         */
        pInterval = setInterval("doit()", 10);
//    } catch (e) {
//        handleError(e);
//    }


}

