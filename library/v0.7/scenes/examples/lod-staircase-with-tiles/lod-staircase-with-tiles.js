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
 * projected size of it's extents. The switching is done by a SceneJS.boundingBox, which selects
 * an appropriate model for its cuuernt projected size from among its child nodes. The child nodes
 * include SceneJS.load nodes that each load a staircase asset from the SceneJS library, each
 * with different parameters for number of steps, appearance etc.
 *
 * Read more about the SceneJS.boundingBox node on the blog at http://wp.me/pRqJ7-1n
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 */

var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',

    /* Proxy that will mediate cross-domain asset loads.
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers and sets GL modes
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.5, g: 0.5, b: 0.5 },
                    enableTexture2D:true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 45.0, aspect : 1.0, near : 0.10, far : 7000.0 },

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

                                            up : { y: 1.0 }
                                        },

                                            /* Lighting
                                             */
                                                SceneJS.lights({
                                                    lights: [
                                                        {
                                                            type:                   "point",
                                                            diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                            specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                                            pos:                    { x: 100.0, y: 0.0, z: -100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        },
                                                        {
                                                            type:                   "point",
                                                            diffuse:                { r: 0.6, g: 0.6, b: 0.6 },
                                                            specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                                            pos:                    { x: -20.0, y: 50.0, z: 0.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        },
                                                        {
                                                            type:                   "point",
                                                            diffuse:                { r: 0.6, g: 0.6, b: 0.6 },
                                                            specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                                            pos:                    { x: 50.0, y: 100.0, z: 0.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                    ]},

                                                    /* Tiled floor asset from the SceneJS library
                                                     */
                                                        SceneJS.load({
                                                            uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                "examples/tiled-floor/tiled-floor.js"
                                                        }),

                                                    /* Our spiral staircase, wrapped with some material colour
                                                     */
                                                        SceneJS.material({
                                                            ambient:   { r: 0.5, g: 0.5, b: 0.5 },
                                                            diffuse:   { r: 0.6, g: 0.6, b: 0.6 },
                                                            specular:  { r: 1, g: 1, b: 1 },
                                                            emission: { r: 0.02, g: 0.02, b: 0.2 },
                                                            shininess: 60.0
                                                        },

                                                            /* Bounding box - roughly fitted to staircase
                                                             */
                                                                SceneJS.boundingBox({
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
                                                                        SceneJS.objects.cube(),

                                                                    /* Level 2 - staircase with 12 very chunky steps
                                                                     * and no texture - a parameterised asset from the
                                                                     * SceneJS library:
                                                                     */
                                                                        SceneJS.withData({
                                                                            stepWidth:7,
                                                                            stepHeight:2.4,
                                                                            stepDepth:3,
                                                                            stepSpacing:6,
                                                                            innerRadius:10,
                                                                            numSteps:12,
                                                                            stepAngle:80 },

                                                                                SceneJS.load({
                                                                                    uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                        "examples/spiral-staircase/spiral-staircase.js"
                                                                                })),

                                                                    /* Level 3 - more detail; staircase with 24 chunky
                                                                     *  steps and no texture - the same parameterised asset
                                                                     * from the SceneJS library, with different parameters:
                                                                     */
                                                                        SceneJS.withData({
                                                                            stepWidth:7,
                                                                            stepHeight:1.2,
                                                                            stepDepth:3,
                                                                            stepSpacing:3,
                                                                            innerRadius:10,
                                                                            numSteps:24,       // Half the number of steps, less coarse
                                                                            stepAngle:40 },

                                                                                SceneJS.load({
                                                                                    uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                        "examples/spiral-staircase/spiral-staircase.js"
                                                                                })),

                                                                    /* Level 4 - yet more detail; staircase with 48 fine
                                                                     * steps and no texture - the asset again, with different
                                                                     * parameters:
                                                                     */
                                                                        SceneJS.withData({
                                                                            stepWidth:7,
                                                                            stepHeight:0.6,
                                                                            stepDepth:3,
                                                                            stepSpacing:1.5,
                                                                            innerRadius:10,
                                                                            numSteps:48,
                                                                            stepAngle:20 },

                                                                                SceneJS.load({
                                                                                    uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                        "examples/spiral-staircase/spiral-staircase.js"
                                                                                })),

                                                                    /* Level 5 - maximum detail; textured staircase with
                                                                     * 48 fine steps - that asset again, this time with a
                                                                     * texture parameter:
                                                                     */
                                                                        SceneJS.withData({
                                                                            stepTexture: "marble",
                                                                            stepWidth:7,
                                                                            stepHeight:0.6,
                                                                            stepDepth:3,
                                                                            stepSpacing:1.5,
                                                                            innerRadius:10,
                                                                            numSteps:48,
                                                                            stepAngle:20 },

                                                                                SceneJS.load({
                                                                                    uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                        "examples/spiral-staircase/spiral-staircase.js"
                                                                                }))
                                                                        )
                                                                )
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
var canvas = exampleScene.getCanvas();

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
    exampleScene.render({ eye : eye, look: { x: eye.x + moveVec[0], y: eye.y, z : eye.z + moveVec[2] }});
};

/* Continue animation
 */
var pInterval = setInterval("window.render()", 10);




