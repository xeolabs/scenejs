/**
 * SceneJS Example - Level-of-detail selection using a boundingBox node #2
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 * This example demonstrates the boundingBox node, which specifies the spatial boundaries of
 * scene graph subtrees so that the subtrees are only traversed when their enclosing
 * boundingBoxes intersect the current view frustum.
 *
 * They can also function as level-of-detail (LOD) selectors, as shown here in the boundingBox
 * about a third of the way down this example.
 *
 *
 */
var exampleScene = SceneJS.scene(

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    canvasId: 'theCanvas',
                    clearColor : { r:0, g:0, b:0.0, a: 1 },
                    viewport:{ x : 0, y : 0, width: 600, height: 600}  ,
                    clear : { depth : true, color : true}
                },
                        SceneJS.lights({
                            lights: [
                                {
                                    pos: { x: 100.0, y: 40.0, z: 0.0 }
                                }
                            ]},
                                SceneJS.perspective({ fovy : 25.0, aspect : 1, near : 0.10, far : 2000.0
                                },
                                        SceneJS.scalarInterpolator({
                                            type:"linear",
                                            input:"alpha",
                                            output:"eyez",
                                            keys: [0.0, 0.3, 1.0],
                                            values: [1200, 0, -1200]
                                        },
                                                SceneJS.scalarInterpolator({
                                                    type:"linear",
                                                    input:"alpha",
                                                    output:"eyex",
                                                    keys: [0.0,  0.3, 1.0],
                                                    values: [-50, 60, 0]
                                                },
                                                        SceneJS.lookAt(function(scope) {
                                                            return {
                                                                eye : { x: scope.get("eyex"), y: 100, z: scope.get("eyez")},
                                                                look : { x : 0.0, y : .0, z : 0 },
                                                                up : { x: 0.0, y: 1.0, z: 0.0 }
                                                            };
                                                        },
                                                                (function () {
                                                                    var materialNodeArgs = [
                                                                        {
                                                                            ambient:  { r:0.3, g:0.3, b:0.9 },
                                                                            diffuse:  { r:0.7, g:0.7, b:0.9 }
                                                                        }
                                                                    ];
                                                                    for (var i = -100; i < 100; i += 20) {
                                                                        for (var i2 = -100; i2 < 100; i2 += 20) {
                                                                            materialNodeArgs.push(

                                                                                    SceneJS.boundingBox({
                                                                                        xmin: i - 3,
                                                                                        ymin: -3,
                                                                                        zmin: i2 - 3,
                                                                                        xmax: i + 3,
                                                                                        ymax: 3,
                                                                                        zmax: i2 + 3,

                                                                                        levels: [
                                                                                            5,
                                                                                            80,
                                                                                            120
                                                                                        ]
                                                                                    },
                                                                                        /* Above level 1 show a cube
                                                                                         */
                                                                                            SceneJS.translate({
                                                                                                x: i,
                                                                                                y : 3,
                                                                                                z: i2
                                                                                            },
                                                                                                    SceneJS.scale({ x: 3, y: 3, z: 3},
                                                                                                            SceneJS.objects.cube()
                                                                                                            )
                                                                                                    ),

                                                                                        /* Above level 1 show a sphere
                                                                                         */
                                                                                            SceneJS.translate({
                                                                                                x: i,
                                                                                                y : 3,
                                                                                                z: i2
                                                                                            },
                                                                                                    SceneJS.scale({ x: 4, y: 4, z: 4},
                                                                                                            SceneJS.objects.sphere()
                                                                                                            )
                                                                                                    ),

                                                                                        /* Above level 3 show a teapot
                                                                                         */
                                                                                            SceneJS.translate({
                                                                                                x: i,
                                                                                                z: i2
                                                                                            },
                                                                                                    SceneJS.scale({ x: 2.5, y: 2.5, z: 2.5},
                                                                                                            SceneJS.objects.teapot()
                                                                                                            )
                                                                                                    )
                                                                                            )
                                                                                    );
                                                                        }
                                                                    }
                                                                    return SceneJS.material.apply(this, materialNodeArgs);
                                                                })())
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );

var alpha = 0;
var pInterval;

function doit() {
    if (alpha < 1) {
        alpha += 0.0005;
        exampleScene.render({"alpha":alpha});
    } else {
        clearInterval(pInterval);
        exampleScene.destroy();
    }
}
pInterval = setInterval("doit()", 10);


