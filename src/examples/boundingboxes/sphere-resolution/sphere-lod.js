/**
 * SceneJS Example - Level-of-detail selection using a boundingBox node
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
 * The boundingBox's 'levels' property specifies thresholds for its projected size, each
 * corresponding to one of its children. At any instant, the child corresponding to the threshold
 * imediately below the node's current projected size is only one currently traversable.
 *
 * As the viewpoint moves closer to the boundingBox, it selects from among four child subtrees
 * as it's projected size increases, starting with a cube, then a low-resolution sphere, then a
 * medium resolution sphere, then at the highest size threshold a high-resolution sphere, all
 * coloured differently so you can see when the selection switches.
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
                                SceneJS.perspective({ fovy : 55.0, aspect : 1, near : 0.10, far : 2000.0
                                },
                                        SceneJS.lookAt(function(scope) {
                                            return {
                                                eye : { z: scope.get("eyez") },
                                                look : { x : 0.0, y : .0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }
                                            };
                                        },
                                                SceneJS.boundingBox({
                                                    xmin: -3,
                                                    ymin: -3,
                                                    zmin: -3,
                                                    xmax:  3,
                                                    ymax:  3,
                                                    zmax:  3,

                                                    levels: [
                                                        10,
                                                        200,
                                                        400,
                                                        600
                                                    ]
                                                },
                                                    /* Size > 10px - draw a pink cube
                                                     */
                                                        SceneJS.material({
                                                            ambient:  { r:0.9, g:0.3, b:0.9 },
                                                            diffuse:  { r:0.9, g:0.7, b:0.9 }
                                                        },
                                                                SceneJS.objects.cube()
                                                                ),

                                                    /* Size > 200px - draw a blue low-detail sphere
                                                     */
                                                        SceneJS.material({
                                                            ambient:  { r:0.3, g:0.3, b:0.9 },
                                                            diffuse:  { r:0.7, g:0.7, b:0.9 }
                                                        },
                                                                SceneJS.objects.sphere({
                                                                    radius: 1,
                                                                    slices:10,
                                                                    rings:10
                                                                })
                                                                ),

                                                    /* Size > 400px - draw a green medium-detail sphere
                                                     */
                                                        SceneJS.material({
                                                            ambient:  { r:0.3, g:0.9, b:0.7 },
                                                            diffuse:  { r:0.7, g:0.9, b:0.7 }
                                                        },
                                                                SceneJS.objects.sphere({
                                                                    radius: 1,
                                                                    slices:20,
                                                                    rings:20
                                                                })
                                                                ),

                                                    /* Size > 600px - draw a red high-detail sphere
                                                     */
                                                        SceneJS.material({
                                                            ambient:  { r:0.9, g:0.3, b:0.3 },
                                                            diffuse:  { r:0.9, g:0.7, b:0.7 }
                                                        },
                                                                SceneJS.objects.sphere({
                                                                    radius: 1,
                                                                    slices:120,
                                                                    rings:120
                                                                })
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );

var eyez = 300;
var pInterval;

function doit() {
    if (eyez > -300) {
        eyez -= 0.5;
        exampleScene.render({"eyez":eyez});
    } else {
        clearInterval(pInterval);
        exampleScene.destroy();
    }
}

pInterval = setInterval("doit()", 10);


