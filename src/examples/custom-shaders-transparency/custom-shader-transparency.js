/*
 A custom shader to do a special transparency effect

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 http://scenejs.wikispaces.com/shader
 https://github.com/xeolabs/scenejs/wiki/layers

 */
SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "library",
            nodes: [

                /*--------------------------------------------------------------------------------
                 * A custom shader to do our special transparency effect.
                 *
                 * SceneJS automatically generates shaders for us - this shader node hooks custom
                 * functions into the fragment shader to set the outgoing fragment's alpha
                 * in proportion to the direction of the fragment's normal vector, providing
                 * the cool transparency effect.
                 *
                 * The shader is then instanced later on in this scene graph to apply it to
                 * the teapot.
                 *
                 * Although not shown in this example, you can have uniforms in your shaders
                 * and expose those as parameters - see the other custom shader examples for
                 * how to do that.
                 *-----------------------------------------------------------------------------*/

                {
                    type: "shader",
                    coreId: "facingRatioXRay",

                    shaders: [

                        /* Just the fragment shader in this example, with no uniforms
                         */
                        {
                            stage:  "fragment",

                            code:  [
                                "vec3 worldNormal = vec3(0.0, 0.0,  1.0);",
                                "vec3 worldEyeVec = vec3(0.0, 0.0, -1.0);",

                                "void myWorldNormalFunc(vec3 vec) {",
                                "   worldNormal = vec;",
                                "}",

                                "void myWorldEyeVecFunc(vec3 vec) {",
                                "   worldEyeVec = vec;",
                                "}",

                                "vec4 myPixelColorFunc(vec4 color) {",
                                "   color.a = (1.0 - abs(dot(worldNormal, worldEyeVec))) - 0.3;",
                                "   return color;",
                                "}"
                            ],

                            /* Bind our custom functions to SceneJS fragment shader hooks
                             */
                            hooks: {
                                worldNormal:    "myWorldNormalFunc",
                                worldEyeVec:    "myWorldEyeVecFunc",
                                pixelColor:     "myPixelColorFunc"
                            }
                        }
                    ]
                }
            ]
        },

        /*----------------------------------------------------------------------
         * View and projection transforms
         *--------------------------------------------------------------------*/

        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: 65.0},
            look : { x : .0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 65.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [

                        /*----------------------------------------------------------------------
                         * Lighting
                         *--------------------------------------------------------------------*/

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -0.7 }
                        },

                        /*----------------------------------------------------------------------
                         * Modelling transforms
                         *--------------------------------------------------------------------*/

                        {
                            type: "rotate",
                            id: "pitch",
                            angle: 30.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: -30.0,
                                    y : 1.0,
                                    nodes: [


                                        /*------------------------------------------------------------------------------
                                         * LAYER 0 (default) - blended first
                                         *
                                         * Opaque cube in center
                                         *----------------------------------------------------------------------------*/

                                        {
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                            specular:       0.3,
                                            shine:          6.0,

                                            nodes: [
                                                {
                                                    type:"scale",
                                                    x: 6,
                                                    y: 6,
                                                    z: 6,

                                                    nodes: [
                                                        {
                                                            type: "cube"
                                                        }

                                                    ]
                                                }
                                            ]
                                        },

                                        /*------------------------------------------------------------------------------
                                         * LAYER 1 - blended last
                                         *
                                         * Outer transparent teapot
                                         *
                                         *----------------------------------------------------------------------------*/

                                        {
                                            type: "layer",
                                            priority: 1,

                                            nodes: [

                                                /*----------------------------------------------------------------------
                                                 * Flag to enable transparency
                                                 *--------------------------------------------------------------------*/

                                                {
                                                    type: "flags",
                                                    flags: {
                                                        transparent: true
                                                    },

                                                    nodes: [

                                                        /*--------------------------------------------------------------
                                                         * Material properties
                                                         *-----------------------------------------------------------*/

                                                        {
                                                            type: "material",
                                                            baseColor:      { r: 0.0, g: 0.0, b: 1.0 },
                                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                                            specular:       0.3,
                                                            shine:          6.0,

                                                            nodes: [

                                                                /*------------------------------------------------------
                                                                 * Modelling transforms
                                                                 *----------------------------------------------------*/

                                                                {
                                                                    type:"translate",
                                                                    y: -9,

                                                                    nodes: [
                                                                        {
                                                                            type:"scale",
                                                                            x: 9,
                                                                            y: 9,
                                                                            z: 9,

                                                                            nodes: [

                                                                                /*--------------------------------------
                                                                                 * Instance our custom shader
                                                                                 *------------------------------------*/

                                                                                {
                                                                                    type: "shader",
                                                                                    coreId: "facingRatioXRay",
                                                                                    nodes: [

                                                                                        /*------------------------------
                                                                                         * Teapot geometry
                                                                                         *----------------------------*/

                                                                                        {
                                                                                            type: "teapot"
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
 * Scene rendering loop and mouse handler stuff
 *---------------------------------------------------------------------*/


var scene = SceneJS.scene("theScene");
var pitchRotate = scene.findNode("pitch");
var yawRotate = scene.findNode("yaw");

var yaw = -30;
var pitch = 30;
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

        pitchRotate.set("angle", pitch);
        yawRotate.set("angle", yaw);
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('touchstart', touchStart, true);
canvas.addEventListener('touchmove', touchMove, true);
canvas.addEventListener('touchend', touchEnd, true);

scene.start();

