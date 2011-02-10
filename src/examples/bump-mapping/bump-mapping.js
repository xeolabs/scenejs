/**
 * Bump mapping example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 */

SceneJS.createNode({
    type: "scene",
    id: "the-scene",
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

                        /* Material properties
                         */
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.9,
                            shine:          6.0,

                            nodes: [
                                {
                                    type: "texture",

                                    /* A texture can have multiple layers, each applying an
                                     * image to a different material or geometry component.
                                     */

                                    /* Our first layer texture is the bump map, and is applied within
                                     * the fragment shader to our geometry node's normal vectors.
                                     */
                                    layers: [

                                        /* Our second texture layer is applied within the fragment
                                         * shader to the baseColor of our material.
                                         */
                                        {
                                            uri:"pattern.jpg",
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
                                            blendMode: "multiply"
                                        },
                                        {
                                            uri:"normal_map.jpg",
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
                                            applyTo:"normals",
                                            blendMode: "multiply"
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
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw = -30;
var pitch = -30;
var lastX;
var lastY;
var dragging = false;

/* For texture animation
 */
var timeLast = (new Date()).getTime();

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

        SceneJS.withNode("pitch").set("angle", pitch);
        SceneJS.withNode("yaw").set("angle", yaw);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}


var canvas = document.getElementById("theCanvas");

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

/* Start the scene - more info: http://scenejs.wikispaces.com/scene#Starting
 */
SceneJS.withNode("the-scene").start({
    fpd: 60,
    idleFunc: function() {
        // ...
    }
});
