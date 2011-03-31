/*

 Instance Demo: Creating a Materials Library

 In this example we define two materials, then within our scene we create
 two boxes, each wrapped with an instance of one of the materials.

 This example demonstrates how you can use instances to create material
 libraries like those used in Collada and Wavefront files.


 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */



/*----------------------------------------------------------------------------
 * Create a materials library containing two materials.
 *
 * Note that we could have put this within the main scene graph if we wanted,
 * in which case we would want to wrap it with a library node so that its
 * material nodes are instead only traversed via the instances that target them.
 *
 *---------------------------------------------------------------------------*/

SceneJS.createNode({

    type: "node",

    nodes: [

        /* Material #1: Red surface with not texture
         */
        {
            type: "material",

            id: "my-red-material",

            baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
            specular:       0.2,
            shine:          6.0
        },


        /* Material #2: Brick textured surface
         */
        {
            type: "material",

            id: "my-brick-material",

            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
            specular:       0.2,
            shine:          6.0,

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
                            blendMode:"multiply",

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
                                x: 1,
                                y: .5
                            }
                        }
                    ]
                }
            ]
        }
    ]
});


/*---------------------------------------------------------------------------
 * A basic scene graph containing two boxes wrapped with instances of
 * materials from the material library we just defined.
 *--------------------------------------------------------------------------*/

SceneJS.createNode({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -25 },
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
                        {
                            type: "rotate",
                            id: "pitch",
                            angle: -30.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 30.0,
                                    y : 1.0,

                                    nodes: [

                                        /* Box wrapped in an instance of the red material
                                         */
                                        {
                                            type: "translate",
                                            x: 2,

                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "my-red-material",
                                                    nodes: [
                                                        {
                                                            type: "box"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },

                                        /* Box wrapped in an instance of the brick material
                                         */
                                        {
                                            type: "translate",
                                            x: -2,

                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "my-brick-material",
                                                    nodes: [
                                                        {
                                                            type: "box"
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

/*---------------------------------------------------------------------------
 * Scene rendering and mouse input stuff
 *--------------------------------------------------------------------------*/

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

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.withNode("the-scene").start();







