/*
 COLLADA Load Example - Seymour Plane Test Model

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a COLLADA asset - the Seymour test model from collada.org

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 injected into the scene graph. Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */

//SceneJS.onEvent("error", function(e) {
//    alert(e.message || e);
//});
//
//SceneJS.onEvent("process-created", function(params) {
//    alert("Process created:" + params.process.description);
//});
//
//SceneJS.onEvent("process-timed-out", function(params) {
//    alert("Process timed out:" + params.process.description);
//});
//
//SceneJS.onEvent("process-killed", function(params) {
//    alert("Process killed:" + params.process.description);
//});
//
//SceneJS.onEvent("error", function(params) {
//    var exception = params.exception;
//    var message = exception.message;
//    if (message != undefined) {
//        alert("Error: " + message);
//    } else {
//        alert("Error: " + exception);
//    }
//});


var exampleScene = SceneJS.scene({

    /* Bind to a WebGL canvas:
     */
    canvasId: 'theCanvas',

    /* URL of the proxy server which will mediate the
     * cross-domain load of our airplane COLLADA model
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_pryoxy.pl" },

    /* Perspective transform:
     */
        SceneJS.perspective({
            fovy : 55.0,
            aspect : 1.0,
            near : 0.10,
            far : 5000.0 },

            /* Viewing transform:
             */
                SceneJS.lookAt({
                    eye : { x: -1.0, y: 0.0, z: 15 },
                    look : { x: -1.0, y: 0, z: 0 },
                    up : { y: 1.0 }
                },

                    /* A lights node inserts lights into the world-space.  You can have as many
                     * lights as you want throughout your scene:
                     */
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                                    diffuse:                true,
                                    specular:               true
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    dir:                    { x: -1.0, y: -1.0, z: -3.0 },
                                    diffuse:                true,
                                    specular:               true
                                }
                            ]},

                            /* Next, modelling transforms to orient our airplane.  These particular
                             * transforms are dynamically configured from data injected into the
                             * scene graph when its rendered:
                             */
                                SceneJS.rotate(function(data) {
                                    return {
                                        angle: data.get('yaw'), y : 1.0
                                    };
                                },
                                        SceneJS.rotate(function(data) {
                                            return {
                                                angle: data.get('pitch'), x : 1.0
                                            };
                                        },

                                            /* Load our COLLADA airplane model:
                                             */
                                                SceneJS.loadCollada({
                                                    uri: "http://www.scenejs.org/library/v0.7/assets/" +
                                                         "examples/seymourplane_triangulate/" +
                                                         "seymourplane_triangulate.dae"
                                                }))
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

var yaw = -45;
var pitch = 25;
var lastX;
var lastY;
var dragging = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = exampleScene.getCanvas();

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
        exampleScene.render({yaw: yaw, pitch: pitch});
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {
    exampleScene.render({yaw: yaw, pitch: pitch});
};

SceneJS.onEvent("error", function(params) {
    clearInterval(pInterval);
    var exception = params.exception;
    var message = exception.message;
    if (message != undefined) {
        alert("Error: " + message);
    } else {
        alert("Error: " + exception);
    }
    throw exception;
});

pInterval = setInterval("window.render()", 10);
