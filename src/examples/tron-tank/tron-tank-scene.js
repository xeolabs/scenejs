/* SceneJS COLLADA import example - the Tank Program from the 1982 Disney motion picture "Tron".
 *
 * This demo is a revamp of the old one for V0.7.6, using new capabilities of V0.7.8:
 *
 * Take it for a drive - mouse wheel controls speed, left/right drag to steer, up/down drag to change viewpoint height.
 *
 * Tank model is courtesy of Abraham Katase, provided in the Google 3D Warehouse at http://tinyurl.com/y8oknya
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 */

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    nodes: [

        /* Renderer node to set BG colour
         */
        {
            type: "node",
            clearColor: { r: 0.3, g: 0.3, b: 0.6 },
            clear: {
                depth : true,
                color : true
            },

            nodes: [


                /**
                 * View transform - we've given it a globally-unique ID
                 * so we can look it up and update it's properties from
                 * mouse input.
                 */
                {
                    type: "lookAt",
                    id: "theLookAt",
                    eye : { x: 0, y: 10, z: -400 },
                    look :  { x: 0, y: 0, z: 0 },
                    up : { x: 0, y: 1, z: .0 },

                    nodes: [
                        {
                            type: "camera",
                            optics: {
                                type: "perspective",
                                fovy : 40.0,
                                aspect : 1.47,
                                near : 0.10,
                                far : 7000.0
                            },

                            nodes: [

                                skySphereJSON,

                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: -1, z: -1.0 }
                                },
                                {
                                    type:"light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: -.5, z: -1.0  }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: -.5, z: 1.0  }
                                },


                                /* Integrate our JSON Tron Tank model, which is defined in tron-tank-model.js
                                 * and loaded via a <script> tag in index.html.
                                 *
                                 * Various nodes (ie. rotate and translate) within the model have been assigned IDs,
                                 * allowing us to locate them and set their properties, in order to move the tank
                                 * around, rotate its cannon etc.
                                 */
                                tankJSON,

                                /* Integrate our grid floor, which is defined in grid-floor.js
                                 * and loaded via a <script> tag in index.html.
                                 */
                                gridFloorJSON,

                                /* Canyon walls, a bunch of cubes
                                 */
                                {
                                    type: "flags",
                                    flags: {
                                        transparent: true
                                    },
                                    nodes: [
                                        {
                                            type:"material",
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.3 },
                                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                            specular:       10.9,
                                            shine:          20.0,
                                            alpha: 0.5,

                                            nodes: [

                                                {
                                                    type: "translate",
                                                    x: -75,
                                                    y: 0,
                                                    z: 0,

                                                    nodes: [

                                                        {
                                                            type: "rotate",
                                                            y: 1,
                                                            angle: 6,
                                                            nodes: [
                                                                {
                                                                    type: "cube",
                                                                    xSize: 50,
                                                                    ySize: 30,
                                                                    zSize: 50
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "translate",
                                                    x: 80,
                                                    y: 0,
                                                    z: 0,

                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            y: 1,
                                                            angle: 0,

                                                            nodes: [
                                                                {
                                                                    type: "cube",
                                                                    xSize: 50,
                                                                    ySize: 30,
                                                                    zSize: 50
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "translate",
                                                    x: -80,
                                                    y: 0,
                                                    z: 80,

                                                    nodes: [
                                                        {
                                                            type : "rotate",
                                                            y: 1,
                                                            angle: -12 ,
                                                            nodes: [
                                                                {
                                                                    type: "cube",
                                                                    xSize: 50,
                                                                    ySize: 30,
                                                                    zSize: 50
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "rotate",
                                                    x: 80,
                                                    y: 0,
                                                    z: 40,

                                                    node:[
                                                        {
                                                            type: "rotate",
                                                            y: 1,
                                                            angle: -12,
                                                            nodes: [
                                                                {
                                                                    type: "cube",
                                                                    xSize: 50,
                                                                    ySize: 30,
                                                                    zSize: 50
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "translate",
                                                    x: 120,
                                                    y: 0,
                                                    z: 140,

                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            y: 1,
                                                            angle: -12 ,

                                                            nodes: [
                                                                {
                                                                    type: "cube",
                                                                    xSize: 50,
                                                                    ySize: 30,
                                                                    zSize: 50
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: -60,
                                                    y: 0,
                                                    z: 160,

                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            y: 1,
                                                            angle: -12,

                                                            nodes: [
                                                                {
                                                                    type: "cube",
                                                                    xSize: 50,
                                                                    ySize: 30,
                                                                    zSize: 50
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
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

var needUpdate = true;
var speed = 0;
var tankPos = { x: 0, y: 0, z: -100 };
var eyeDir = 0;
var eye = { x: 0, y: 10, z: -400 };

var lastX;
var lastX2;
var lastY2;
var lastY;
var dragging = false;

var tankYaw = 0;
var tankYawInc = 0;

var trailYaw = 0;
var trailYawInc = 0;

var pitch = 25;
var pitchInc = 0;

var turretRotating = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastX2 = lastX;
    lastY2 = lastY;
    lastY = event.clientY;
    dragging = true;
}

function touchStart(event) {
    lastX = event.targetTouches[0].clientX;
    lastX2 = lastX;
    lastY2 = lastY;
    lastY = event.targetTouches[0].clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
    tankYawInc = 0;
    pitchInc = 0;
}

function touchEnd() {
    dragging = false;
    tankYawInc = 0;
    pitchInc = 0;
}

function mouseMove(event) {
    var posX = event.clientX;
    var posY = event.clientY;
    actionMove(posX,posY);
}

function touchMove(event) {
    var posX = event.targetTouches[0].clientX;
    var posY = event.targetTouches[0].clientY;
    actionMove(posX,posY);
}

/* On a mouse/touch drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function actionMove(posX, posY) {
    if (dragging) {
        tankYawInc = (posX - lastX) * -0.01;
        pitchInc = (lastY - posY) * 0.001;
        lastX2 = posX;
        lastY2 = posY;
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
canvas.addEventListener('touchstart', touchStart, true);
canvas.addEventListener('touchmove', touchMove, true);
canvas.addEventListener('touchend', touchEnd, true);
canvas.addEventListener('mousewheel', mouseWheel, true);
canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

SceneJS.bind("error", function(e) {
    alert(e.exception.message);
});

SceneJS.scene("theScene").start({

    idleFunc: function() {

        if (!needUpdate && ( pitchInc == 0 && tankYawInc == 0 && speed == 0 && trailYaw == 0)) {
            return;
        }
        needUpdate = false;

        pitch += pitchInc;

        if (pitch < 1) {
            pitch = 1;
        }

        if (pitch > 80) {
            pitch = 80;
        }

        tankYaw += tankYawInc;
        var tankYawMat = Matrix.Rotation(tankYaw * 0.0174532925, $V([0,1,0]));

        var moveVec = [0,0,1];

        moveVec = tankYawMat.multiply($V(moveVec)).elements;

        var trailVec = [0,0, -1 - (pitch * 0.02)];

        var trailPitchMat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0]));
        var trailYawMat = Matrix.Rotation(trailYaw * 0.0174532925, $V([0,1,0]));

        trailVec = trailPitchMat.multiply($V(trailVec)).elements;
        trailVec = trailYawMat.multiply($V(trailVec)).elements;

        if (speed) {
            tankPos.x += moveVec[0] * speed;
            tankPos.y += moveVec[1] * speed;
            tankPos.z += moveVec[2] * speed;
        }

        if (eye.y > 100.0) {
            eye.y = 100.0;
        }

        if (eye.y < 20.0) {
            eye.y = 20.0;
        }

        eye.x = tankPos.x + (trailVec[0] * 35);
        eye.y = tankPos.y + (trailVec[1] * 35);
        eye.z = tankPos.z + (trailVec[2] * 35);

        /* "this" is the scene
         */

        this.findNode("theLookAt").set({   // Find node somewhere within the scene 
            eye: eye,
            look: {
                x: tankPos.x,
                y: tankPos.y,
                z : tankPos.z
            }
        });

        this.findNode("tankPos").set({
            x: tankPos.x,
            z: tankPos.z
        });

        this.findNode("tankRotate").set({
            angle: tankYaw + 180 || 180
        });

        this.findNode("tankGunRotate").set({
            angle: -tankYaw
        });

        if (trailYaw > tankYaw) {
            trailYaw -= (((trailYaw - tankYaw) * 0.01)) + 0.1;
        } else if (trailYaw < tankYaw) {
            trailYaw += (((tankYaw - trailYaw) * 0.01)) + 0.1;
        }
    }
});


