/*
 SceneJS allows a mesh to be collectively constructed by a hierarchy of multiple Geometry nodes, such that the root
 Geometry defines arrays for positions and uv coordinates, while sub-Geometry's supply indexes to define primitives
 (faces, lines etc).  When a geometry is defined with positions but no indices, then child Geometry nodes are expected
 to supply the indices.

 This is a powerful technique for optimising static scenes, and is used in games such as Quake 3 etc. It is also
 neccessary for "multi-materials", where different materials/textures can be applied to different subsections of the
 same mesh.

 It may also be useful for switching representations of geometry - between wireframe and solid, for example.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 This example constructs a custom cube from multiple geometries, decorating different faces with different textures.

 */


SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -55 },
            look : { y:1.0 },
            up : { y: 1.0 },

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
                            color:                  { r: 0.5, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.7, g: 0.7, b: 0.7 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our teapot
                         * by a given angle.
                         */
                        {
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [

                                        /**
                                         * Root Geometry defines vertex and uv arrays which are shared
                                         * among index arrays on sub-Geometry's
                                         */
                                        {
                                            type: "geometry",

                                            /* The vertices - eight for our cube, each
                                             * one spanning three array elements for X,Y and Z
                                             */
                                            positions : [

                                                /* v0-v1-v2-v3 front
                                                 */
                                                5, 5, 5,
                                                -5, 5, 5,
                                                -5,-5, 5,
                                                5,-5, 5,

                                                /* v0-v3-v4-v5 right
                                                 */
                                                5, 5, 5,
                                                5,-5, 5,
                                                5,-5,-5,
                                                5, 5,-5,

                                                /* v0-v5-v6-v1 top
                                                 */
                                                5, 5, 5,
                                                5, 5,-5,
                                                -5, 5,-5,
                                                -5, 5, 5,

                                                /* v1-v6-v7-v2 left
                                                 */
                                                -5, 5, 5,
                                                -5, 5,-5,
                                                -5,-5,-5,
                                                -5,-5, 5,

                                                /* v7-v4-v3-v2 bottom
                                                 */
                                                -5,-5,-5,
                                                5,-5,-5,
                                                5,-5, 5,
                                                -5,-5, 5,

                                                /* v4-v7-v6-v5 back
                                                 */
                                                5,-5,-5,
                                                -5,-5,-5,
                                                -5, 5,-5,
                                                5, 5,-5
                                            ],

                                            /* Normal vectors, one for each vertex
                                             */
                                            normals : [

                                                /* v0-v1-v2-v3 front
                                                 */
                                                0, 0, -1,
                                                0, 0, -1,
                                                0, 0, -1,
                                                0, 0, -1,

                                                /* v0-v3-v4-v5 right
                                                 */
                                                -1, 0, 0,
                                                -1, 0, 0,
                                                -1, 0, 0,
                                                -1, 0, 0,

                                                /* v0-v5-v6-v1 top
                                                 */
                                                0, -1, 0,
                                                0, -1, 0,
                                                0, -1, 0,
                                                0, -1, 0,

                                                /* v1-v6-v7-v2 left
                                                 */
                                                1, 0, 0,
                                                1, 0, 0,
                                                1, 0, 0,
                                                1, 0, 0,

                                                /* v7-v4-v3-v2 bottom
                                                 */
                                                0,1, 0,
                                                0,1, 0,
                                                0,1, 0,
                                                0,1, 0,

                                                /* v4-v7-v6-v5 back
                                                 */
                                                0, 0,1,
                                                0, 0,1,
                                                0, 0,1,
                                                0, 0,1
                                            ],

                                            /* 2D texture coordinates corresponding to the
                                             * 3D positions defined above - eight for our cube, each
                                             * one spaining two array elements for X and Y
                                             */
                                            uv : [

                                                /* v0-v1-v2-v3 front
                                                 */
                                                5, 5,
                                                0, 5,
                                                0, 0,
                                                5, 0,

                                                /* v0-v3-v4-v5 right
                                                 */
                                                0, 5,
                                                0, 0,
                                                5, 0,
                                                5, 5,

                                                /* v0-v5-v6-v1 top
                                                 */
                                                5, 0,
                                                5, 5,
                                                0, 5,
                                                0, 0,

                                                /* v1-v6-v7-v2 left
                                                 */
                                                5, 5,
                                                0, 5,
                                                0, 0,
                                                5, 0,

                                                /* v7-v4-v3-v2 bottom
                                                 */
                                                0, 0,
                                                5, 0,
                                                5, 5,
                                                0, 5,

                                                /* v4-v7-v6-v5 back
                                                 */
                                                0, 0,
                                                5, 0,
                                                5, 5,
                                                0, 5
                                            ],

                                            nodes: [
                                                {
                                                    type: "texture",

                                                    layers: [
                                                        {
                                                            uri:"images/BrickWall.jpg" ,
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
                                                                x: .1,
                                                                y: .05
                                                            }
                                                        }
                                                    ],

                                                    nodes: [
                                                        {
                                                            type: "material",

                                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.2,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "geometry",

                                                                    /* Indices for first three faces
                                                                     */
                                                                    indices : [

                                                                        /* Front
                                                                         */
                                                                        0, 1, 2,
                                                                        0, 2, 3,

                                                                        /* Right
                                                                         */
                                                                        4, 5, 6,
                                                                        4, 6, 7,

                                                                        /* Top
                                                                         */
                                                                        8, 9,10,
                                                                        8,10,11
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "texture",

                                                    /* A texture can have multiple layers, each applying an
                                                     * image to a different material reflection component.
                                                     * This layer applies the Zod image to the diffuse
                                                     * component, with animated scaling.
                                                     */
                                                    layers: [
                                                        {
                                                            uri:"images/general-zod.jpg",
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
                                                            type: "material",
                                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.2,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "geometry",

                                                                    /* Indices for remaining three faces
                                                                     */
                                                                    indices : [

                                                                        /* Left
                                                                         */
                                                                        12,13,14,
                                                                        12,14,15,

                                                                        /* Bottom
                                                                         */
                                                                        16,17,18,
                                                                        16,18,19,

                                                                        /* Back
                                                                         */
                                                                        20,21,22,
                                                                        20,22,23
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
 * Enable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : true
    }
});


var yaw = 30;
var pitch = -30;
var lastX;
var lastY;
var dragging = false;

var canvas = document.getElementById("theCanvas");

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
        pitch += (event.clientY - lastY) * -0.5;

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


SceneJS.withNode("theScene").start({
    idleFunc: function() {
        SceneJS.withNode("yaw").set({angle: yaw});
        SceneJS.withNode("pitch").set({angle: pitch});
        SceneJS.withNode("theScene").render();
    }
});






