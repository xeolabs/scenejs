/* Demonstrates level-of-detail selection with dynamically-loaded assets.
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 * Drag the mouse up and down to move forwards and backwards, left and right to turn.
 *
 * Move backwards and watch the staircase simplify.
 *
 * This scene contains a staircase model that switches representations as a function of the
 * projected size of it's extents. The switching is done by a bounding box, which selects
 * an appropriate child for its current projected size from among its child nodes.
 */
SceneJS.createNode({

    type: "scene",

    id: "the-scene",

    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "fog",
            mode:"linear",
            color: { r:.0, g:0.0,  b:.0 },
            start: 0,
            end:2000  ,
            density:300.0,

            nodes: [
                {
                    type: "lookAt",
                    id: "the-lookat",
                    eye : { x: 0, y: 10, z: -150 },
                    look : { x :  0, y: 20, z: 0 },
                    up : { y: 1.0 },

                    nodes: [
                        {
                            type: "camera",
                            optics: {
                                type: "perspective",
                                fovy : 45.0,
                                aspect : 1.47,
                                near : 0.10,
                                far : 7000.0
                            },

                            nodes: [

                                /* Integrate our sky sphere, which is defined in sky-sphere.js
                                 */
                                {
                                    type : "instance",
                                    target :"sky-sphere"
                                },

                                /* Lights, after the sky sphere to avoid applying to it                                                                     
                                 */
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 2.0, y: 1.0, z: 0.0 }
                                },

                                /* Instantiate our staircase, defined in staircase.js
                                 */
                                {
                                    type: "instance",
                                    target: "lod-stairs"
                                }
                                ,

                                /* Instantiate our tiled floor, defined in tiled-floor.js
                                 */
                                {
                                    type: "instance",
                                    target: "tiled-floor"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var eye = { x: 0, y: 10, z: -150 };
var look = { x :  0, y: 20, z: 0 };
var speed = 0;
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
var moveAngle = 0;
var moveAngleInc = 0;

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
    speed = 0;
    moveAngleInc = 0;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (!lastX) {
        lastX = event.clientX;
        lastY = event.clientY;
    }
    if (dragging) {
        moveAngleInc = (event.clientX - lastX) * 0.002;
        speed = (lastY - event.clientY) * 0.01;
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
            speed -= 0.2;
        } else {
            speed += 0.2;
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

//var count = 0;

window.render = function() {

    moveAngle -= moveAngleInc;

    /* Using Sylvester Matrix Library to create this matrix
     */
    var rotMat = Matrix.Rotation(moveAngle * 0.0174532925, $V([0,1,0]));
    var moveVec = rotMat.multiply($V([0,0,1])).elements;
    if (speed) {
        eye.x += moveVec[0] * speed;
        eye.z += moveVec[2] * speed;
    }

    /* Send message to the lookat node to update it off the mouse input.
     *
     * We could also use SceneJS.withNode("the-lookat").set({ eye: eye, look: { ... } });
     */
    SceneJS.Message.sendMessage({
        command: "update",
        target: "the-lookat",
        set: {
            eye: eye,
            look: { x: eye.x + moveVec[0], y: eye.y, z : eye.z + moveVec[2] }
        }
    });

    /* Render the scene graph
     */
    SceneJS.withNode("the-scene").render();
};

var pInterval;

SceneJS.bind("error", function(e) {
    alert(e.exception.message);
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});


pInterval = window.setInterval("window.render()", 30);






