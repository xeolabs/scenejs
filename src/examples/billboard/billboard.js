/*
 This example demonstrates how to define geometry, in this case a simple square sprite
 object that supports texturing.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 This example assumes that you have looked at a few of the other examples
 and now have an understanding of concepts such as basic SceneJS syntax,
 lighting, material, data flow etc.

 Scroll down to the SceneJS.geometry node about one third of the way down
 this file and I'll guide you from there.

 */

SceneJS.createNode({
    id: "SalomonSprite",
    type: "billboard",
    nodes: [
        {
            type: "texture",
            layers: [ { uri: "images/avatar.png" } ],
            nodes: [
                {
                    type: "square",
                    xSize: 1.2, ySize: 1.2
                }
            ]
        }
    ]
});



SceneJS.createNode({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0, y: 1, z: -25 },
            look : { x: 0, y: 1, z: 0 },
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
                            mode: "dir",
                            color: { r: 1, g: 1, b: 1 },
                            dir: {x:0, y:4, z:5},
                            diffuse: true,
                            specular: false,
                        },
                        {
                            type: "light",
                            mode: "dir",
                            color: { r: 1, g: 1, b: 1 },
                            dir: {x:0, y:4, z:-5},
                            diffuse: true,
                            specular: false,
                        },
                        {
                            type: "rotate",
                            id: "yaw",
                            y: 1,
                            nodes: [
                                {
                                    type: "rotate",
                                    id: "pitch",
                                    x: 1,
                                    nodes: [
                                        {
                                            type: "translate",
                                            x: 2, y: 0, z: 0,
                                            nodes: [
                                                {
                                                    type: "texture",
                                                    layers: [ { uri: "images/mars.jpg", flipY: false } ],
                                                    nodes: [
                                                        { type: "sphere", slices: 15, rings: 15 }
                                                    ]
                                                },
                                                {
                                                    type: "translate",
                                                    x: 1, y: 4, z: 0,
                                                    nodes: [
                                                        {
                                                            type: "instance",
                                                            target: "SalomonSprite"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "translate",
                                            x: -3, y: 0, z: -1,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "SalomonSprite"
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


var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var canvas = document.getElementById("theCanvas");

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

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

pitch = 0;

window.render = function() {
    SceneJS.withNode("pitch").set("angle", pitch);
    SceneJS.withNode("yaw").set("angle", yaw);
    SceneJS.withNode("the-scene").render();
};

/* Render loop until error or reset
 * (which IDE does whenever you hit that run again button)
 */
var pInterval;

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);
