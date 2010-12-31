/*
 Sending a message that inserts a textured instance of a box into a scene

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */



/*---------------------------------------------------------------------------
 * A basic scene graph with lights and a couple of modelling rotations
 *--------------------------------------------------------------------------*/

SceneJS.createNode({
    type: "scene",
    id: "the-scene",
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
                                        {
                                            type: "node",
                                            id: "add-node-here"
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


/*----------------------------------------------------------------------------
 * A scaled box geometry
 *---------------------------------------------------------------------------*/

SceneJS.createNode({
    type: "scale",

    id: "my-box",

    x: 4.0,
    y: 4.0,
    z: 4.0,

    nodes: [
        {
            type: "box"
        }
    ]
});

/*----------------------------------------------------------------------------
 * Send message to insert textured instance of the box into our scene
 *---------------------------------------------------------------------------*/

SceneJS.Message.sendMessage({

    target: "add-node-here",

    command: "update",

    add: {
        node: {

            type: "material",

            id: "my-material",

            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
            specular:       0.9,
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
                            blendMode:"add",

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
                    ],

                    nodes:[
                        {
                            type: "instance",
                            target:"my-box"
                        }
                    ]
                }
            ]
        }
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







