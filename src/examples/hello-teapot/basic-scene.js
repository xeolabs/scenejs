/*
 Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 To render the teapot, SceneJS will traverse the scene in depth-first order. Each node will set some
 WebGL state on visit, then un-set it again before exit. In this graph, the root
 scene node binds to a Canvas element, then the rest of the nodes specify various transforms, lights,
 material properties, all wrapping a teapot geometry node.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 updated on rotate nodes from mouse input.

 https://github.com/xeolabs/scenejs/wiki/JSON-API

 */

SceneJS.createScene({

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    nodes: [

        /* Viewing transform
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [

                /* Projection
                 */
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

                        /* Renderer node to set BG colour
                         */
                        {
                            type: "renderer",
                            clearColor: { r: 0.3, g: 0.3, b: 0.6 },
                            clear: {
                                depth : true,
                                color : true
                            },

                            nodes: [

                                /* Point lights
                                 */
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
                                    color:                  { r: 1.0, g: 1.0, b: 0.8 },
                                    diffuse:                true,
                                    specular:               false,
                                    dir:                    { x: 0.0, y: -0.5, z: -1.0 }
                                },

                                /* Modelling transforms - note the IDs, "pitch" and "yaw"
                                 */
                                {
                                    type: "rotate",
                                    id: "pitch",
                                    angle: 0.0,
                                    x : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "yaw",
                                            angle: 0.0,
                                            y : 1.0,

                                            nodes: [

                                                /* Ambient, diffuse and specular surface properties
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.5, g: 0.5, b: 0.6 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       1.0,
                                                    shine:          70.0,

                                                    nodes: [

                                                        /* Teapot geometry - a built-in teapot type
                                                         */
                                                        {
                                                            type : "teapot"
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


/* Get handles to some nodes
 */
var scene = SceneJS.scene("theScene");
var yawNode = scene.findNode("yaw");
var pitchNode = scene.findNode("pitch");

/* As mouse drags, we'll update the rotate nodes
 */

var lastX;
var lastY;
var dragging = false;

var newInput = false;
var yaw = 0;
var pitch = 0;


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

function actionMove(posX, posY) {
    if (dragging) {

        yaw += (posX - lastX) * 0.5;
        pitch += (posY - lastY) * 0.5;

        lastX = posX;
        lastY = posY;

        newInput = true;

    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('touchstart', touchStart, true);
canvas.addEventListener('touchmove', touchMove, true);
canvas.addEventListener('touchend', touchEnd, true);

/* Start the scene rendering
 */
scene.start({
    idleFunc: function() {
        if (newInput) {
            yawNode.set("angle", yaw);
            pitchNode.set("angle", pitch);
            newInput = false;
        }
    }
});

