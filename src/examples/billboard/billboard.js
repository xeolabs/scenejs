/*
 This example demonstrates how to define billboards, in this case a simple quad sprite
 object that supports texturing.

 Shouts to Salomon Brys for this example - salomon.brys@gmail.com

 https://github.com/xeolabs/scenejs/wiki/billboard

 */

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        {
            type: "lookAt",
            eye : { x: 0, y: 1, z: 25 },
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
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
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
                                            x: 2,
                                            y: 0,
                                            z: 0,
                                            nodes: [
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        {
                                                            uri: "../web/images/mars.jpg",
                                                            flipY: false
                                                        }
                                                    ],
                                                    nodes: [
                                                        {
                                                            type: "sphere"
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "translate",
                                                    x: 1,
                                                    y: 4,
                                                    z: 0,
                                                    nodes: [
                                                        {
                                                            type: "billboard",
                                                            nodes: [
                                                                {
                                                                    type: "texture",
                                                                    layers: [
                                                                        {
                                                                            uri: "../web/images/avatar.png" ,
                                                                            blendMode: "add"
                                                                        }
                                                                    ],
                                                                    nodes: [
                                                                        {
                                                                            type: "quad",
                                                                            xSize: 1.2,
                                                                            ySize: 1.2
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "translate",
                                            x: -3,
                                            y: 0,
                                            z: -1,
                                            nodes: [
                                                {
                                                    type: "billboard",
                                                    nodes: [
                                                        {
                                                            type: "texture",
                                                            layers: [
                                                                {
                                                                    uri: "../web/images/avatar.png" ,
                                                                    blendMode: "add"
                                                                }
                                                            ],
                                                            nodes: [
                                                                {
                                                                    type: "quad",
                                                                    xSize: 1.2,
                                                                    ySize: 1.2
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

var scene = SceneJS.scene("theScene");

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

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

var canvas = document.getElementById("theCanvas");

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

scene.start({

    /* It's more efficient to update nodes within the idle func
     * rather than as each mouse event occurs. That way SceneJS
     * doesnt have to buffer lots of redundant updates to process.  
     */
    idleFunc: function() {
        scene.findNode("pitch").set("angle", pitch);
        scene.findNode("yaw").set("angle", yaw);
    }
});
