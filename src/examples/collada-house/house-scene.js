/*
 COLLADA Load Example - VaST Courtyard House

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a content module that was translated from a COLLADA file -
 a house model courtesty of VaST architecture:

 http://www.vastarchitecture.com/Projects_Residential/Courtyard/Courtyard.html

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 injected into the scene graph along with "dist" for the distance of the eye on the Z-axis. Take a close look
 at the lookAt and rotate nodes, which use these variables, and the invocation of the "render" function near
 the bottom of this example, which passes them in.

 */


var exampleScene = SceneJS.scene({ canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            sid: "lookat",
            eye : { x: -1.0, y: 100.0, z: 1000 },
            look : { x: -1.0, y: 50, z: 0 },
            up : { y: 1.0 }
        },
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 5000.0  }
                },
                        SceneJS.light({
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                            diffuse:                true,
                            specular:               true
                        }),

                        SceneJS.light({
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: -1.0, y: -1.0, z: -3.0 },
                            diffuse:                true,
                            specular:               true
                        }),

                    /* Next, modelling transforms to orient the house.  These particular
                     * transforms are dynamically configured from data injected into the
                     * scene graph when its rendered:
                     */
                        SceneJS.rotate({
                            sid: "pitch",
                            angle : { name: "pitch", value: 0.0 },
                            x : 1.0
                        },
                                SceneJS.rotate({
                                    sid: "yaw",
                                    angle : { name: "yaw", value: 0.0 },
                                    y : 1.0
                                },
                                        SceneJS.rotate({
                                            x:1,
                                            angle:270
                                        },

                                            /* Use our house model, defined in house.js
                                             * and loaded via a <script> tag in index.html
                                             */
                                                houseModel )
                                        )
                                )
                        )
                )
        )
        ;


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var pInterval;

var yaw = 305;
var pitch = 10;
var lastX;
var lastY;
var dragging = false;
var dist = 1000;
var speed = 0;

/* Always get canvas from scene - it will try to bind to a default canvas
 * when it can't find the one specified
 */
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
        pitch += (event.clientY - lastY) * 0.5;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

function mouseWheel(event) {
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }
    if (delta) {
        if (delta < 0) {
            speed += 2;
        } else {
            speed -= 2;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('mousewheel', mouseWheel, true);

canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

window.render = function() {
    dist += speed;
    if (dist < 100) {
        dist = 100;
    }
    if (dist > 2000) {
        dist = 2000;
    }
    if (pitch < 1) {
        pitch = 1;
    }

    if (pitch > 80) {
        pitch = 80;
    }

    var configs = {

        "#lookat" : {
            "eye" : {
                z: dist
            },

            "#pitch": {
                pitch: pitch,

                "#yaw": {
                    yaw: yaw
                }
            }
        }
    };

    exampleScene
            .setConfigs(configs)
            .render();
};

SceneJS.addListener("error", function(e) {
    alert(e.exception.message);
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);
