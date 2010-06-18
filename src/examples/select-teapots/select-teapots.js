/**
 * SceneJS Example - Switchable Geometry using the Selector Node.
 *
 * A Selector node is a branch node that selects which among its children are currently active.
 *
 * In this example, a Selector contains four Teapot nodes, of which it initially selects the first,
 * second and fourth. By editing its "selection" property, you can change which of the Teapots
 * are rendered.
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 */
var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 30.0, y: 0.0, z: 35.0},
            look : { x : 15.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }
        },

                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 65.0,
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0  }
                },

                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -2.0, y: -1.0, z: 0.0 }
                                }
                            ]},
                                SceneJS.material({
                                    baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                                    specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                                    specular:       0.9,
                                    shine:          6.0
                                },

                                    //----------------------------------------------------------------------------------
                                    // Our Selector node selects three of its four sub-graphs to display three Teapots.
                                    // Try changing the indices in its "selection" property to change its selection.
                                    //----------------------------------------------------------------------------------

                                        SceneJS.selector({selection: [0, 1, 3]},

                                                SceneJS.translate({y : 15},
                                                        SceneJS.text({text: "     Selector selection contains 0"}),
                                                        SceneJS.objects.teapot()),

                                                SceneJS.translate({y : 5},
                                                        SceneJS.text({text: "     Selector selection contains 1"}),
                                                        SceneJS.objects.teapot()),

                                                SceneJS.translate({y : -5},
                                                        SceneJS.text({text: "     Selector selection contains 2"}),
                                                        SceneJS.objects.teapot()),

                                                SceneJS.translate({y : -15},
                                                        SceneJS.text({text: "     Selector selection contains 3"}),
                                                        SceneJS.objects.teapot())
                                                )
                                        )
                                )
                        )
                )
        );

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

/* Throw the switch, Igor!
 * We render the scene, injecting the initial angles for the rotate nodes.
 */
exampleScene.render({yaw: yaw, pitch: pitch});

var canvas = document.getElementById(exampleScene.getCanvasId());
;

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;
        exampleScene.render({yaw: yaw, pitch: pitch});
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);



