/**
 * SceneJS Example - Switchable Viewpoint using the Symbol, Instance and Selector Nodes.
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 *
 */

SceneJS.onEvent("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});

var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

    //--------------------------------------------------------------------------------------------------------------
    // The scene content, a teapot illuminated by two light sources.
    // We'll defined it within a Symbol that will be referenced by an
    // Instance node within each child of our Selector, down below.
    //--------------------------------------------------------------------------------------------------------------

        SceneJS.symbol({ name: "theScene" },
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
                                SceneJS.objects.teapot()
                                )
                        )
                ),

        SceneJS.perspective({
            fovy : 65.0, aspect : 1.0, near : 0.10, far : 300.0
        },

            //------------------------------------------------------------------------------------------------------
            // Our Selector node selects one of three LookAt child nodes
            // to provide the current view point. Each LookAt contains an
            // instance of the scene content.
            //------------------------------------------------------------------------------------------------------

                SceneJS.selector({ selection: [2] }, // Try varying this index among {0, 1, 2}

                    // First view point - looking down the -Z axis

                        SceneJS.lookAt({
                            eye : { z: 10.0 }
                        },
                                SceneJS.instance({ name: "theScene"})),

                    // Second view point - looking down the -X axis

                        SceneJS.lookAt({
                            eye : { x: 10.0 }
                        },
                                SceneJS.instance({ name: "theScene"})),

                    // Third view point - oblique

                        SceneJS.lookAt({
                            eye : { x: -5.0, y: 5, z: 5 }
                        },
                                SceneJS.instance({ name: "theScene"}))
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



