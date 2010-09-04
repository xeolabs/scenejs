/* Demonstrates level-of-detail selection with dynamically-loaded assets.
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 * Drag the mouse up and down to move forwards and backwards, left and right to turn.
 *
 * Move backwards and watch the staircase simplify.
 *
 * This scene contains a staircase model that switches representations as a function of the
 * projected size of it's extents. The switching is done by a SceneJS.BoundingBox, which selects
 * an appropriate child for its current projected size from among its child nodes. 
 */
var lookat;

var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

    /* Fog, nice and thick, just for fun
     */
        SceneJS.fog({
            mode:"linear",
            color: { r:.50, g:.50,b:.50 },
            start: 0,
            end:600  ,
            density:300.0
        },

            /* View transform - takes viewing parameters through the data passed
             * into this scene as it is rendered. Those parameters are generated
             * in mouse handlers outside the scene graph - see below.
             */
                lookat = SceneJS.lookAt({
                    eye : { x: 0, y: 10, z: -150 },
                    look : { x :  0, y: 20, z: 0 },
                    up : { y: 1.0 }
                },

                    /* Perspective camera
                     */
                        SceneJS.camera({
                            optics: {
                                type: "perspective",
                                fovy : 45.0,
                                aspect : 1.47,
                                near : 0.10,
                                far : 7000.0  }
                        },

                            /* Integrate our sky sphere, which is defined in sky-sphere.js
                             */
                                skySphere,

                            /* Lighting
                             */
                                SceneJS.light({
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                }),

                                SceneJS.light({
                                    mode:                   "dir",
                                    color:                  { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 2.0, y: 1.0, z: 0.0 }
                                }),

                            /* Integrate our tiled floor, which is defined in tiled-floor.js
                             */
                                tiledFloor,

                                new SceneJS.boundingBox({
                                    xmin: -20,
                                    ymin: -20,
                                    zmin: -20,
                                    xmax:  20,
                                    ymax:  20,
                                    zmax:  20,

                                    /* We'll do level-of-detail selection with this
                                     * boundingBox - five representations at
                                     * different sizes:
                                     */
                                    levels: [
                                        10,     // Level 1
                                        200,    // Level 2
                                        400,    // Level 3
                                        500,    // Level 4
                                        600     // Level 5
                                    ]
                                },

                                    /* And here are the child nodes:
                                     */

                                    /* Level 1 - a cube to at least show a dot on the horizon
                                     */
                                        SceneJS.cube(),

                                    /* Level 2 - staircase with 12 very chunky steps
                                     * and no texture. Staircase factory function is defined in staircase.js
                                     */
                                        createStaircase({
                                            stepWidth:7,
                                            stepHeight:2.4,
                                            stepDepth:3,
                                            stepSpacing:6,
                                            innerRadius:10,
                                            numSteps:12,
                                            stepAngle:80 }),

                                    /* Level 3 - more detail; staircase with 24 chunky
                                     *  steps and no texture
                                     */
                                        createStaircase({
                                            stepWidth:7,
                                            stepHeight:1.2,
                                            stepDepth:3,
                                            stepSpacing:3,
                                            innerRadius:10,
                                            numSteps:24,       // Half the number of steps, less coarse
                                            stepAngle:40 }),

                                    /* Level 4 - yet more detail; staircase with 48 fine
                                     * steps and no texture
                                     */
                                        createStaircase({
                                            stepWidth:7,
                                            stepHeight:0.6,
                                            stepDepth:3,
                                            stepSpacing:1.5,
                                            innerRadius:10,
                                            numSteps:48,
                                            stepAngle:20 }),

                                    /* Level 5 - maximum detail; textured staircase with
                                     * 48 fine steps
                                     */
                                        createStaircase({
                                            withTexture: true,
                                            stepWidth:7,
                                            stepHeight:0.6,
                                            stepDepth:3,
                                            stepSpacing:1.5,
                                            innerRadius:10,
                                            numSteps:48,
                                            stepAngle:20 })
                                        )


                                )
                        )
                )
        )
        ;

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var eye = { x: 0, y: 10, z: -150 };
var look = { x :  0, y: 20, z: 0 };
var speed = 0;
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
var moveAngle = 0;
var moveAngleInc = 0;


/* Always get the canvas from the scene graph - it might bind to
 * a default one of it can't find the one specified.
 */
var canvas = document.getElementById(exampleScene.getCanvasId());

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
    speed = 0;
    moveAngleInc = 0;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (!lastX) {
        lastX = event.clientX;
        lastY = event.clientY;
    }
    if (dragging) {
        moveAngleInc = (event.clientX - lastX) * 0.002;
        speed = (lastY - event.clientY) * 0.01;
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
            speed -= 0.2
        } else {
            speed += 0.2
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

window.render = function() {
    moveAngle -= moveAngleInc;

    /* Using Sylvester Matrix Library to create this matrix
     */
    var rotMat = Matrix.Rotation(moveAngle * 0.0174532925, $V([0,1,0]));
    var moveVec = rotMat.multiply($V([0,0,1])).elements;
    if (speed) {

        eye.x += moveVec[0] * speed;
        eye.z += moveVec[2] * speed;
    }

    /* Update view transform
     */
    lookat.setEye(eye);
    lookat.setLook({ x: eye.x + moveVec[0], y: eye.y, z : eye.z + moveVec[2] });

    /* Render scene
     */
    exampleScene.render();
};

/* Render loop until error or reset
 * (which IDE does whenever you hit that run again button)
 */
var pInterval;

SceneJS.addListener("error", function(e) {
    alert(e.exception.message);
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);






