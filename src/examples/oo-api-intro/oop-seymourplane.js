/*
 Object-Oriented API Example - Seymour Plane Test Model

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 V0.7.3 introduced a core object-oriented class API, with a layer of factory functions on top which provide a handy
 functional API. Therefore, you have the choice of using the framework in either an object-oriented or functional
 style.

 V0.7.6 introduced modular content, which may be loaded from the same domain, or cross-domain

 Latest class API Docs are at: http://www.scenejs.org/api-docs.html

 Here's the Seymour plane example, this time with most of the scene constructed through
 the composition of objects. Note that towards the end of this example we start using
 the original functional API again, to show how they can be mixed.
 */

SceneJS.requireModule("modules/seymourplane/seymourplane.js");

// Create scene root object.

var exampleScene = new SceneJS.Scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas" ,

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv"
});

// For brevity, we can just instantiate nodes inside that
// addNode method and get the reference it returns:

var look = exampleScene.addNode(
        new SceneJS.LookAt({
            eye : { x: -1.0, y: 0.0, z: 10 },
            look : { x: -1.0, y: 0, z: 0 },
            up : { y: 1.0 }
        }));

// We can then access the state of nodes through getters and setters:

look.setEye({ z:15 });

// Create a perspective node and attach it to the LookAt

var camera = new SceneJS.Camera({
    optics: {
        type: "perspective",
        fovy : 55.0,
        aspect : 1.0,
        near : 0.10,
        far : 300.0 }
});

look.addNode(camera);


// Attach some lights:

var lights = camera.addNode(
        new SceneJS.Lights({
            sources: [
                {
                    type:                   "dir",
                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                    dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                    diffuse:                true,
                    specular:               true
                }
            ]}));

// Add one more light source to the lights node:

lights.addSource(
        new SceneJS.LightSource({
            type:                   "dir",
            color:                  { r: 1.0, g: 1.0, b: 1.0 },
            dir:                    { x: -1.0, y: -1.0, z: -3.0 },
            diffuse:                true,
            specular:               true
        }));

// Attach modelling transforms and Collada import node:

lights.addNode(
        new SceneJS.Rotate(function(data) {
            return {
                angle: data.get('yaw'), y : 1.0
            };
        },

            // You can mix the functional style in with OO any time you like.

            // Note that every class has a factory function - class name starts
            // with capital letter, function name starts with small letter.

            // The only other difference between the two APIs is that the class
            // requires the "new" operator. Otherwise, the node configuration signature
            // is exactly the same.

                SceneJS.rotate(function(data) {
                    return {
                        angle: data.get('pitch'), x : 1.0
                    };
                },
                    /* Use our airplane model:
                     */
                        SceneJS.useModule({
                            name: "seymour-plane"
                        }))
                )
        );


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
    exampleScene
            .setData({yaw: yaw, pitch: pitch})
            .render();
};

SceneJS.addListener("error", function(event) {
    alert(event.exception.message);
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function(event) {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);
