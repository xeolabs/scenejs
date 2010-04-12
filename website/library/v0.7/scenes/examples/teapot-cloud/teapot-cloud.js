/**
 * SceneJS Example - Three hundred teapots
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 * In this scene, the viewpoint moves through a randomly-generated
 * cluster of OpenGL teapots. A generator node dynamically instances
 * the cluster - note how the elems array, containing the teapot
 * positions, is memoised in a closure. More info on generators
 * is available in the generator examples. Then we repeatedly render
 * the scene, each time feeding in a scope containing an increasing
 * value for the eye's location on the Z-axis, which is read by the
 * lookAt node.
 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clearColor : { r:.0, g:.0, b:.0, a: 0 },
                    viewport: { x:0, y:0, width:600, height:600 },
                    clear : { depth : true, color : true} ,
                    depthRange : { near: .5, far: 1500 }
                },
                        SceneJS.perspective({ fovy : 43.0, aspect : 1.0, near : .5, far : 1500.0
                        },
                                SceneJS.fog({
                                    mode:"exp",
                                    color:{r:.0, g:.0,b:.0},
                                    start: 50,
                                    end:400
                                },

                                        SceneJS.lookAt(function(scope) {
                                            return{
                                                eye : { x: 0.0, y: 0, z: scope.get("z")},
                                                look : { x : 0.0, y : 0.0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }
                                            };
                                        },
                                                SceneJS.lights({
                                                    sources: [
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                                        },
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: 2.0, y: 1.0, z: 0.0 }
                                                        }

                                                    ]},

                                                        SceneJS.generator(
                                                                (function() {
                                                                    var elems = [];
                                                                    for (var i = 0; i < 300; i++) {
                                                                        elems.push({
                                                                            baseColor: {
                                                                                r:  Math.random() + 0.5,
                                                                                g: Math.random() + 0.5,
                                                                                b: Math.random() + 0.5
                                                                            },
                                                                            pos: {x: (50 * Math.random()) - 25.0,
                                                                                y: (50 * Math.random()) - 25.0,
                                                                                z: (800 * Math.random()) - 250.0
                                                                            }

                                                                        });
                                                                    }
                                                                    var j = 0;
                                                                    return function() {
                                                                        if (i < elems.length) {
                                                                            return { param: elems[i++] };
                                                                        } else {
                                                                            i = 0;
                                                                        }
                                                                    };
                                                                })(),
                                                                SceneJS.material(function(data) {
                                                                    return {
                                                                        baseColor:      data.get("param").baseColor,
                                                                        specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                        specular:       20.9,
                                                                        shine:          100.0
                                                                    };
                                                                },
                                                                        SceneJS.translate(function(data) {
                                                                            return data.get("param").pos;
                                                                        },
                                                                                SceneJS.scale({ x:2, y:2, z:2 },
                                                                                        SceneJS.objects.teapot())
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

var pInterval;
var zpos = -500;

window.doit = function() {
    if (zpos > 1500) {
        clearInterval(pInterval);
        exampleScene.destroy();
    } else {
        zpos += 2.0;

        exampleScene.render({z:(zpos == 0 ? 0.1 : zpos)}); // Don't allow lookAt node's 'look' to equal its 'at'
    }
};

/* Hack to get any scene definition exceptions up front.
 * Chrome seemed to absorb them in setInterval!
 */
exampleScene.render({z:(zpos == 0 ? 0.1 : zpos)});

/* Continue animation
 */
pInterval = setInterval("window.doit()", 10);



