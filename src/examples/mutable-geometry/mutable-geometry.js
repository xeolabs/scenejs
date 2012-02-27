/*
 This example demonstrates how to define and mutate geometry

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 https://github.com/xeolabs/scenejs/wiki/geometry

 */


SceneJS.createScene({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    flags: {
        backfaces: false
    },

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 55 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            dir:                    { x: 0.0, y: -0.5, z: 1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },
                        {
                            type: "rotate",
                            id: "pitch",
                            angle: -30.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 30.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                            specularColor:  { r: 0.4, g: 0.4, b: 0.4 },
                                            specular:       0.2,
                                            shine:          6.0,

                                            nodes: [

                                                {
                                                    type: "geometry",

                                                    id: "my-geometry",

                                                    primitive: "triangles",

                                                    positions : [

                                                        5, 5, 5, -5, 5, 5,-5,-5, 5, 5,-5, 5,    // v0-v3-v4-v5 right
                                                        5, 5, 5, 5,-5, 5, 5,-5,-5,5, 5,-5,      // v0-v3-v4-v5 right
                                                        5, 5, 5, 5, 5,-5, -5, 5,-5, -5, 5, 5,   // v0-v5-v6-v1 top
                                                        -5, 5, 5, -5, 5,-5, -5,-5,-5, -5,-5, 5, // v1-v6-v7-v2 left
                                                        -5,-5,-5, 5,-5,-5, 5,-5, 5, -5,-5, 5,   // v7-v4-v3-v2 bottom
                                                        5,-5,-5, -5,-5,-5,-5, 5,-5,  5, 5,-5    // v4-v7-v6-v5 back
                                                    ],

                                                    normals : [

                                                        0, 0, -1, 0, 0, -1, 0, 0, -1,0, 0, -1,  // v0-v1-v2-v3 front
                                                        -1, 0, 0,-1, 0, 0, -1, 0, 0,-1, 0, 0,   // v0-v3-v4-v5 right
                                                        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // v0-v5-v6-v1 top
                                                        1,  0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
                                                        0,  1, 0, 0,1, 0, 0,1, 0, 0,1, 0,       // v7-v4-v3-v2 bottom
                                                        0,  0,1, 0, 0,1, 0, 0,1, 0, 0,1         // v4-v7-v6-v5 back
                                                    ],

                                                    uv : [

                                                        5, 5, 0, 5, 0, 0, 5, 0, // v0-v1-v2-v3 front
                                                        0, 5, 0, 0, 5, 0, 5, 5, // v0-v3-v4-v5 right
                                                        5, 0, 5, 5, 0, 5, 0, 0, // v0-v5-v6-v1 top
                                                        5, 5, 0, 5, 0, 0, 5, 0, // v1-v6-v7-v2 left
                                                        0, 0, 5, 0, 5, 5, 0, 5, // v7-v4-v3-v2 bottom
                                                        0, 0, 5, 0, 5, 5, 0, 5  // v4-v7-v6-v5 back
                                                    ],

                                                    uv2 : [
                                                    ],

                                                    indices : [

                                                        0, 1, 2, 0, 2, 3,   // Front
                                                        4, 5, 6, 4, 6, 7,   // Right
                                                        8, 9,10, 8,10,11,   // Top
                                                        12,13,14, 12,14,15, // Left
                                                        16,17,18, 16,18,19, // Bottom
                                                        20,21,22, 20,22,23  // Back
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

var yaw = 30;
var pitch = -30;
var lastX;
var lastY;
var dragging = false;

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function touchStart(event) {
    lastX = event.targetTouches[0].clientX;
    lastY = event.targetTouches[0].clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

function touchEnd() {
    dragging = false;
}

var scene = SceneJS.scene("the-scene");

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

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function actionMove(posX, posY) {
    if (dragging) {
        yaw += (posX - lastX) * 0.5;
        pitch += (posY - lastY) * 0.5;

        lastX = posX;
        lastY = posY;

        scene.findNode("pitch").set("angle", pitch);
        scene.findNode("yaw").set("angle", yaw);
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('touchstart', touchStart, true);
canvas.addEventListener('touchmove', touchMove, true);
canvas.addEventListener('touchend', touchEnd, true);

var geometry = scene.findNode("my-geometry");

var factor = 0;
var time = 0;

scene.start({
    idleFunc: function() {
        geometry.set("positions", {
            positions: [
                +factor,  +factor,  +factor, -factor, +factor, +factor, -factor, -factor, +factor, +factor,-factor,  +factor, // v0-v3-v4-v right
                +factor,  +factor,  +factor, +factor, -factor, +factor, +factor, -factor, -factor, +factor, +factor, -factor, // v0-v3-v4-v right
                +factor,  +factor,  +factor, +factor, +factor, -factor, -factor, +factor, -factor, -factor, +factor, +factor, // v0-v 5* factor-v6-v1 top
                -factor,  +factor,  +factor, -factor, +factor, -factor, -factor, -factor, -factor, -factor, -factor, +factor, // v1-v6-v7-v2 left
                -factor,  -factor,  -factor, +factor, -factor, -factor, +factor, -factor, +factor, -factor, -factor, +factor, // v7-v4-v3-v2 bottom
                +factor,  -factor,  -factor, -factor, -factor, -factor, -factor, +factor, -factor, +factor, +factor, -factor  // v4-v7-v6-v  back
            ]
        });
        factor = 3 + Math.sin(time);
        time += 0.01;
    }
});




