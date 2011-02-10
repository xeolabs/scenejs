/**
 * Animated texture example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 */

SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: -10},
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
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.9,
                            shine:          6.0,

                            nodes: [


                                /** Textures images are loaded asynchronously and won't render
                                 * immediately. On first traversal, they start loading their image,
                                 * which they collect on a subsequent traversal.
                                 */
                                {
                                    type: "texture",

                                    id: "theTexture",

                                    /* A texture can have multiple layers, each applying an
                                     * image to a different material reflection component.
                                     * This layer applies the Zod image to the diffuse
                                     * component, with animated scaling.
                                     */
                                    layers: [
                                        {
                                            uri:"general-zod.jpg",
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
                                            blendMode: "multiply",

                                            /* Texture rotation angle in degrees
                                             */
                                            rotate: 0.0,

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

/*------------------------------------------------------------------------------------------------------------------
 * SceneJS debug modes
 *
 *----------------------------------------------------------------------------------------------------------------*/

SceneJS.setDebugConfigs({

    /* Enable scene compilation - see http://scenejs.wikispaces.com/V0.8+Branch
     */
    compilation : {
        enabled: true
//        logTrace : {}
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff
 *---------------------------------------------------------------------*/

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

function mouseUp() {
    dragging = false;
}

function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;
        lastX = event.clientX;
        lastY = event.clientY;

        SceneJS.withNode("pitch").set("angle", pitch);
        SceneJS.withNode("yaw").set("angle", yaw);
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.withNode("theScene").start();

window.updateAnimations = function() {
    SceneJS.withNode("theTexture").set("layers", {
        "0":{
            scale: {
                x: texScale,
                y: texScale
            },
            rotate: texAngle
        }
    });
    texAngle += 0.4;
    texScale = (texScale + 0.01) % 10.0;
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.updateAnimations()", 10);