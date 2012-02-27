/**
 * Animated texture example
 *
 * In this example we're creating two texture layers, then animating the
 * rotation, scale and blendFactor of the second layer to create the effect
 * of multiple spinning General Zods that fade in and out over an underlying
 * image of SuperMan.
 *
 * More info:
 *
 * https://github.com/xeolabs/scenejs/wiki/texture
 *
 */


SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: 10},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.7, g: 0.7, b: 0.7 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.5, z: -1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.3,
                            shine:          10.0,

                            nodes: [
                                {
                                    type: "texture",

                                    id: "theTexture",

                                    layers: [
                                        {
                                            uri:"../web/images/superman.jpg",
                                            minFilter: "linear",
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
                                            applyTo:"baseColor",
                                            blendMode: "add",
                                            blendFactor: 1.0
                                        },
                                        {
                                            uri:"../web/images/general-zod.jpg",
                                            minFilter: "linear",
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
                                            applyTo:"baseColor",
                                            blendMode: "add",
                                            blendFactor: 1.0,

                                            /* Texture rotation angle in degrees
                                             */
                                            rotate: {
                                                z: 0.0
                                            },

                                            /* Texture translation offset
                                             */
                                            translate : {
                                                x: 0,
                                                y: 0
                                            },

                                            /* Texture scale factors
                                             */
                                            scale : {
                                                x: 1.0,
                                                y: 1.0
                                            }
                                        }
                                    ],

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "pitch",
                                            angle: -30.0,
                                            x : 1.0,

                                            nodes: [
                                                {
                                                    type: "rotate",
                                                    id: "yaw",
                                                    angle: -30.0,
                                                    y : 1.0,

                                                    nodes: [
                                                        {
                                                            type: "cube"
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

var yaw = -30;
var pitch = -30;
var lastX;
var lastY;
var dragging = false;

var texAngle = 0.0;
var texScale = 1.0;

/* For texture animation
 */
var timeLast = (new Date()).getTime();

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

scene.start({
    idleFunc: function() {

        /* Animate scale, rotate and blendFactor of second texture layer
         */
        scene.findNode("theTexture").set("layers", {
            "1":{
                scale: {
                    x: texScale,
                    y: texScale
                },
                rotate: {
                    z: texAngle
                },

                // http://scenejs.wikispaces.com/texture#Texture%20Layers-Layer%20Blend%20Factor

                blendFactor: Math.abs(Math.sin(texAngle * 0.01))
            }
        });
        texAngle += 0.4;
        texScale = (texScale + 0.01) % 10.0;
    }
});
