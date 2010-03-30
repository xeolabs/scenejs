/*  Demonstrates level-of-detail selection. This scene contains a staircase which switches
 *  representations as a function of it's projected view-volume size. The staircase is
 * a parameterised asset, dynamically loaded from the SceneJS content library.
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
                    viewport:{ x : 1, y : 1, width: 1600, height: 800},
                    clearColor: { r:0.5, g: 0.5, b: 0.5 },
                    enableTexture2D:true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 45.0, aspect : 2.0, near : 0.10, far : 7000.0 },

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
                                                    sources: [
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: .8, g: 0.8, b: 0.8 },
                                                            diffuse:                true,
                                                            specular:               false,
                                                            pos:                    { x: 100.0, y: 4.0, z: -100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                        ,
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            pos:                    { x: 100.0, y: -100.0, z: -100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        },
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            pos:                    { x: -1000.0, y: -1000.0, z: 0.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                    ]},


                                                        SceneJS.material({
                                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                                            specular:       0.9,
                                                            shine:          6.0
                                                        },
                                                                SceneJS.texture({
                                                                    layers: [
                                                                        {
                                                                            uri:"http://scenejs.org/library/textures/stone/Stone45l.jpg",
                                                                            minFilter: "linearMipMapLinear",
                                                                            magFilter: "linear",
                                                                            wrapS: "repeat",
                                                                            wrapT: "repeat",
                                                                            isDepth: false,
                                                                            depthMode:"luminance",
                                                                            depthCompareMode: "compareRToTexture",
                                                                            depthCompareFunc: "lequal",
                                                                            flipY: false,
                                                                            width: 1,
                                                                            height: 1,
                                                                            internalFormat:"lequal",
                                                                            sourceFormat:"alpha",
                                                                            sourceType: "unsignedByte",
                                                                            applyTo:"color",
                                                                            scale : { x: 300, y: 300, z: 1.0 }

                                                                        }
                                                                    ]},
                                                                        SceneJS.scale(function(data) {
                                                                            return { x: 6400, y: .5, z : 4800 };
                                                                        },
                                                                                SceneJS.objects.cube()
                                                                                )
                                                                        )
                                                                ),


                                                    /* Our spiral staircase, wrapped with some material colour
                                                     */
                                                        SceneJS.material({
                                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0
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
                                                                     * different sizes
                                                                     */
                                                                    levels: [
                                                                        10,     // Level 1
                                                                        200,    // Level 2
                                                                        400,    // Level 3
                                                                        500,    // Level 4
                                                                        600     // Level 5
                                                                    ]
                                                                },

                                                                    /* Level 1 - a cube to at least show a dot on the horizon
                                                                     */
                                                                        SceneJS.objects.cube(),

                                                                    /* Level 2 - staircase with 12 very chunky steps
                                                                     * and no texture
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
                                                                     *  steps and no texture
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
                                                                     * steps and no texture
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
                                                                     * 48 fine steps
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

var eye = { x: 0, y: 10, z: -250 };
var look = { x :  0, y: 20, z: 0 };
var speed = 0;
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
//var moveVec =  { x :  0, y: 0, z: 10 };
var moveAngle = 0;
var moveAngleInc = 0;

var canvas = document.getElementById("theCanvas");

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
