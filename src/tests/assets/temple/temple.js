/*
 COLLADA Load Example - Seymour Plane Test Model

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a COLLADA asset - the Seymour test model from collada.org

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 passed down via data "scopes". Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas',

    /* URL of the proxy server which will mediate the
     * cross-domain load of our airplane COLLADA model
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.0, g: 0.0, b: 0.0 },
                    enableTexture2D: true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 25.0, aspect : 1.0, near : 0.10, far : 5000.0 },

                            /* Fog, nice and thick, just for fun
                             */
                                SceneJS.fog({
                                    mode:"linear",
                                    color:{r:.50, g:.50,b:.50},
                                    start: 0,
                                    end:600  ,
                                    density:300.0
                                },

                                    /* View transform - takes viewing parameters through the data passed
                                     * into this scene as it is rendered. Those parameters are generated
                                     * in mouse handlers outside the scene graph - see below.
                                     */
                                        SceneJS.lookAt({

                                            eye : function(data) {
                                                return data.get("eye");
                                            },

                                            look : function(data) {
                                                return data.get("look");
                                            },

                                            up : { x: 0, y: 1, z: .0 }
                                        },

                                            /* A lights node inserts lights into the world-space.
                                             * You can have many of these, maybe nested within modelling transforms
                                             * if you want to move them around.
                                             */
                                                SceneJS.lights({
                                                    sources: [
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                                                        },
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: -1.0, y: 1.0, z: -3.0 }
                                                        }
                                                    ]},


                                                        SceneJS.load({
                                                            uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                "examples/tiled-floor/tiled-floor.js"
                                                        }),

                                                    /* Next, modelling transforms to orient our airplane
                                                     by a given angle.  See how these rotate nodes take a
                                                     function which creates its configuration object?

                                                     You can do that when you want a node's configuration to be
                                                     evaluated dynamically at traversal-time. The function
                                                     takes a scope, which is SceneJS's mechanism for passing
                                                     variables down into a scene graph. Using the angle
                                                     variable on the scope, the function creates a
                                                     configuration that specifies a rotation about the X-axis.
                                                     Further down you'll see how we inject that angle
                                                     variable when we render the scene.
                                                     */
                                                        SceneJS.translate({ x: 20, y: -15, z: 0 },
                                                                SceneJS.rotate({ y: 1, angle: 90 },
                                                                        SceneJS.rotate({ x: 1, angle: 270 },

                                                                                SceneJS.scale({ x: 0.1, y: 0.1, z: 0.1 },
                                                                                    /* Load COLLADA temple model from the SceneJS
                                                                                     * model repository. Asset node we are loading is "default".
                                                                                     */
                                                                                        SceneJS.loadCollada({
                                                                                            uri: "http://www.scenejs.org/library/v0.7/assets/examples/temple/models/model.dae"
                                                                                        })))))
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var timeStarted = new Date().getTime();
var speed = 0;

var tankPos = { x: 0, y: 0, z: 0 };

var eyeDir = 0;
var eye = { x: 0, y: 0, z: 0 };

var lastX;
var lastY;
var dragging = false;

var yaw = 0;
var yawInc = 0;
var pitch = 0;
var pitchInc = 0;

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
    yawInc = 0;
    pitchInc = 0;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yawInc = (event.clientX - lastX) * -0.005;
        pitchInc = (lastY - event.clientY) * -0.005;
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
            speed += 0.5;
        } else {
            speed -= 0.5;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('mousewheel', mouseWheel, true);


var pInterval;

window.render = function() {
    try {
        pitch += pitchInc;
        yaw += yawInc;

        if (pitch < -90) {
            pitch = -90;
        }

        if (pitch > 90) {
            pitch = 90;
        }
        var pitchMat = SceneJS_math_rotationMat4v(pitch * 0.0174532925, [1,0,0]);
        var yawMat = SceneJS_math_rotationMat4v(yaw * 0.0174532925, [0,1,0]);

        var moveVec = [0,0, 1];

        moveVec = SceneJS_math_transformVector3(pitchMat, moveVec);
        moveVec = SceneJS_math_transformVector3(yawMat, moveVec);

        if (speed) {
            eye.x -= moveVec[0] * speed;
            eye.y -= moveVec[1] * speed;
            eye.z -= moveVec[2] * speed;

        }
        exampleScene.render({
            eye : eye,
            look: {
                x: eye.x + moveVec[0],
                y: eye.y + moveVec[1],
                z: eye.z + moveVec[2]
            }
        });
    } catch(e) {
        clearInterval(pInterval);
        throw e;
    }
};


pInterval = setInterval("window.render()", 10);
