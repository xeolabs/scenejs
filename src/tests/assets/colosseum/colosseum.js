/*
 * The Colosseum or Roman Coliseum, originally the Flavian Amphitheatre, is an
 * elliptical amphitheatre in the center of the city of Rome, Italy, the largest
 * ever built in the Roman Empire.
 *
 * Use the mouse to fly around - drag left and right, up and down to
 * change heading and use the mouse wheel to accellerate forwards and backwards.
 *
 * This COLLADA model comes courtesy of Google 3D Warehouse: http://bit.ly/auHc2u
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 */

var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',

    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" }, // JSONP proxy

        SceneJS.perspective({  fovy : 30.0, aspect : 2.0, near : 0.10, far : 2000.0 },

                SceneJS.lookAt(function(data) {
                    return {
                        eye :  data.get("eye"),
                        look :  data.get("look"),
                        up : { x: 0, y: 1, z: .0 }
                    };
                },
                        SceneJS.renderer({
                            clearColor: {r : 0.6, g: 0.6, b: 0.6 }
                        },

                                SceneJS.fog({
                                    mode:"linear",
                                    color:{r:.6, g:.6,b:.6},
                                    start: 0,
                                    end:1500  ,
                                    density:400.0
                                },

                                        SceneJS.scale({x: 5, y: 5, z: 5},
                                                SceneJS.rotate({y: 1, angle: 2},
                                                        SceneJS.rotate({z: 1, angle: 180},

                                                                SceneJS.rotate({x: 1, angle: 90},

                                                                        SceneJS.lights({
                                                                            sources: [

                                                                                {
                                                                                    type:                   "dir",
                                                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                                                    diffuse:                true,
                                                                                    specular:               false,
                                                                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                                                                },
                                                                                {
                                                                                    type:                   "dir",
                                                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                                                    diffuse:                true,
                                                                                    specular:               false,
                                                                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                                                                },
                                                                                {
                                                                                    type:                   "dir",
                                                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                                                    diffuse:                true,
                                                                                    specular:               false,
                                                                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                                                                }
                                                                            ]},

                                                                                SceneJS.loadCollada({
                                                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/colosseum/models/model.dae"
                                                                                })))
                                                                )
                                                        )
                                                )))
                        )
                )
        );

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var timeStarted = new Date().getTime();
var speed = 0;

var tankPos = { x: 0, y: 0, z: 0 };

var eyeDir = 0;
var eye = { x: 0, y: 180, z: -1330 };

var lastX;
var lastY;
var dragging = false;

var yaw = 0;
var yawInc = 0;
var pitch = 0;
var pitchInc = 0;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());;

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
    yawInc = 0;
    pitchInc = 0;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yawInc = (event.clientX - lastX) * -0.005;
        pitchInc = (lastY - event.clientY) * -0.005;
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
            speed += 0.5;
        } else {
            speed -= 0.5;
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

window.render = function() {
    pitch += pitchInc;
    yaw += yawInc;

    if (pitch < -90) {
        pitch = -90;
    }

    if (pitch > 90) {
        pitch = 90;
    }
    var pitchMat = SceneJS_math_rotationMat4v(pitch * 0.0174532925, [1,0,0]);
    var yawMat = SceneJS_math_rotationMat4v(yaw * 0.0174532925, [0,1,0]);

    var moveVec = [0,0, 1];

    moveVec = SceneJS_math_transformVector3(pitchMat, moveVec);
    moveVec = SceneJS_math_transformVector3(yawMat, moveVec);

    if (speed) {
        eye.x -= moveVec[0] * speed;
        eye.y -= moveVec[1] * speed;
        eye.z -= moveVec[2] * speed;

    }
    exampleScene.render({
        eye : eye,
        look: {
            x: eye.x + moveVec[0],
            y: eye.y + moveVec[1],
            z: eye.z + moveVec[2]
        }
    });
};

var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);