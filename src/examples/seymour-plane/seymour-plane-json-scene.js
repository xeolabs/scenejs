/*
 Seymour Plane Test Model - using a combination of node classes and factory functions

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 V0.7.3 introduced a core object-oriented class API, with a layer of factory functions on top which provide a handy
 functional API. Therefore, you have the choice of using the framework in either an object-oriented or functional
 style.

 V0.7.8 introduced a JSON API, with which scene graphs and models (such as the Seymour Plane in this example) can
 be constructed and processed outside of a browser that supports WebGL, unlike JavaScript scenes. JSON is also
 repurposable, and makes better sense for server-client transport. Also, looking to the long-term roadmap, it decouples
 scene definitions from the SceneJS API.

 Latest class API Docs are at: http://www.scenejs.org/api-docs.html

 Here's the Seymour plane example, this time with most of the scene around it constructed through the composition of
 objects. Note that towards the end of this example we start using the original functional API again, to show how they
 can be mixed.
 */


SceneJS.createNode({
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
                            dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                            diffuse:                true,
                            specular:               true
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: -1.0, y: -1.0, z: -3.0 },
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

                                        /* Instance our airplane model, defined in seymour-plane-model.js,
                                         * which was loaded via a <script> tag in index.html. The script
                                         * immediately created the airplane node, assigning it an ID
                                         * we'll refer to it by.
                                         */
                                        {
                                            type: "instance",
                                            id: "my-airplane",
                                            target: "org.scenejs.examples.collada.seymourplane.scene"
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

function mouseUp() {
    dragging = false;
}

function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * 0.5;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {
    SceneJS.withNode("pitch").set("angle", pitch);
    SceneJS.withNode("yaw").set("angle", yaw);
    SceneJS.withNode("myScene").render();
};

pInterval = setInterval("window.render()", 10);


SceneJS.bind("error", // Listen for errors on SceneJS
        function(event) {
            alert(event.exception.message);
            window.clearInterval(pInterval);
        });

