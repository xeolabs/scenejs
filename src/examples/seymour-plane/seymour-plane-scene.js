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

/* We'll retain references to some of our nodes
 * in case we want to call setters/getters on them
 */

var look;
var camera;
var light1;
var light2;
var rotateY;
var rotateX;

var exampleScene = new SceneJS.Scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas" ,

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv"
},
        look = new SceneJS.LookAt({
            eye : { x: -1.0, y: 0.0, z: 15 },
            look : { x: -1.0, y: 0, z: 0 },
            up : { y: 1.0 }
        },
                camera = new SceneJS.Camera({
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0 }
                },
                        light1 = new SceneJS.Light({
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                            diffuse:                true,
                            specular:               true
                        }),

                        light2 = new SceneJS.Light({
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            dir:                    { x: -1.0, y: -1.0, z: -3.0 },
                            diffuse:                true,
                            specular:               true
                        }),

                        rotateY = SceneJS.rotate({
                            sid: "yaw",
                            angle : { name: "yaw", value: 0.0 },
                            y : 1.0
                        },

                            // You can mix the functional style in with OO any time you like.

                            // Note that every class has a factory function - class name starts
                            // with capital letter, function name starts with small letter.

                            // The only other difference between the two APIs is that the class
                            // requires the "new" operator. Otherwise, the node configuration signature
                            // is exactly the same.

                                rotateX = SceneJS.rotate({
                                    sid: "pitch",
                                    angle : { name: "pitch", value: 30.0 },
                                    x : 1.0
                                },

                                    /* Use our plane model, defined in seymour-plane-model.js
                                     * and loaded via a <script> tag in index.html
                                     */
                                        seymourPlane)
                                )
                        )));


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

var yaw = 305;
var pitch = 10;
var lastX;
var lastY;
var dragging = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
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

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {

    rotateX.setAngle(pitch);
    rotateY.setAngle(yaw);

    exampleScene.render();
};

SceneJS.bind("error", function(event) {
    alert(event.exception.message);
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function(event) {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);
