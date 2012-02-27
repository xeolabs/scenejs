/*
 Seymour Plane Test Model 

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 V0.7.8 introduced a JSON API, with which scene graphs and models (such as the Seymour Plane in this example) can
 be constructed and processed outside of a browser that supports WebGL - unlike JavaScript scenes. JSON is also
 repurposable, and makes better sense for server-client transport. Also, looking to the long-term roadmap, it decouples
 scene definitions from the SceneJS API.

 Latest class API Docs are at: http://www.scenejs.org/api-docs.html
 */


SceneJS.createScene({
    type: "scene",
    id: "myScene",
    canvasId: "theCanvas" , // Bind to canvas
    loggingElementId: "theLoggingDiv", // Log to DIV

    nodes: [
        {
            type: "lookAt",
            id: "theLookat",
            eye : { x: -1.0, y: 0.0, z: 15 },
            look : { x: -1.0, y: 0, z: 0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 },
                            diffuse:                true,
                            specular:               true
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: -1.0, y: -0.5, z: -3.0 },
                            diffuse:                true,
                            specular:               true
                        },
                        {
                            type: "rotate",
                            id: "yaw",
                            angle : 0.0 ,
                            y : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "pitch",
                                    angle : 30.0,
                                    x : 1.0,

                                    nodes: [

                                        /* Integrate our airplane model, defined in seymour-plane-model.js,
                                         * which was loaded via a <script> tag in index.html.
                                         */
                                        planeJSON
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
 * Disable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : false
    }
});


var pInterval;
var yaw = 305;
var pitch = 10;
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

        var scene = SceneJS.scene("myScene");
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

SceneJS.scene("myScene").start();