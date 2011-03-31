/*
 Introductory SceneJS scene which demonstrates the imagebuf node

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com



 */
SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes: [

        /*-------------------------------------------------------------------------------------------
         * First subgraph renders our rotating teapot, with light blue backdrop, to a texture.
         *
         * The subgraph is wrapped in an imageBuf node, which captures each frame the subgraph
         * renders and makes it available by ID as an image source for the texture node defined in the
         * second subgraph, defined further down in this example.
         *
         * The imageBuf captures the frames to a hidden frame buffer, so they will not render by
         * themselves and will only be visible via the texture.
         *
         * This example assumes that you know what the various other node types are - see the
         * other examples first if you're not sure.
         *------------------------------------------------------------------------------------------*/

        {
            type: "imageBuf",
            id: "teapot-imagebuf",

            nodes: [

                {
                    type: "lookAt",
                    eye : { x: 0.0, y: 10.0, z: -15 },
                    look : { y:1.0 },
                    up : { y: 1.0 },

                    nodes: [
                        {
                            type: "camera",
                            optics: {
                                type: "perspective",
                                fovy : 25.0,
                                aspect : 1,
                                near : 0.10,
                                far : 300.0
                            },

                            nodes: [
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                },

                                /* Light blue backdrop slab
                                 */
                                {
                                    type: "material",
                                    emit: 20,
                                    baseColor:      { r: 0.0, g: 1, b:1 },
                                    specularColor:  { r: 0., g: 0., b: 1. },
                                    specular:       0.9,
                                    shine:          100.0,

                                    nodes: [
                                        {
                                            type:"translate",
                                            z:15,
                                            nodes: [
                                                {
                                                    type:"scale",
                                                    x:20,
                                                    y:20,
                                                    nodes:[
                                                        {
                                                            type : "cube"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },

                                /* Blue teapot, oriented with a couple of rotations
                                 */
                                {
                                    type: "rotate",
                                    id: "teapot-pitch",
                                    angle: 180.0,
                                    x : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "teapot-yaw",
                                            angle: 0.0,
                                            y : 1.0,

                                            nodes: [

                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          100.0,


                                                    nodes: [
                                                        {
                                                            type : "teapot"
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
        },

        /*-------------------------------------------------------------------------------------------
         * The second subgraph renders a cube with a texture that is dynamically sourced from
         * the imageBuf defined in the subgraph above.
         *------------------------------------------------------------------------------------------*/

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
                            type:          "light",
                            mode:          "dir",
                            color:         { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:       true,
                            specular:      false,
                            dir:           { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type:          "light",
                            mode:          "dir",
                            color:         { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:       true,
                            specular:      false,
                            dir:           { x: 0.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type:          "light",
                            mode:          "dir",
                            color:         { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:       true,
                            specular:      false,
                            dir:           { x: -1.0, y: 0.0, z: -1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 0.5, g: 0.5, b: 0.5 },
                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                            specular:       0.9,
                            shine:          6.0,

                            nodes: [
                                {
                                    type: "texture",
                                    id: "theTexture",

                                    /* Recall that textures can have multiple layers. Our texture has just
                                     * one, which sources it's image from the imageBuf we defined earlier.
                                     */
                                    layers: [
                                        {
                                            imageBuf: "teapot-imagebuf",
                                            blendMode: "multiply"
                                        }
                                    ],

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "cube-pitch",
                                            angle: 0.0,
                                            x : 1.0,

                                            nodes: [
                                                {
                                                    type: "rotate",
                                                    id: "cube-yaw",
                                                    angle: 0.0,
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

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

/* Start rendering the scene graph. On each frame, increment the rotation
 * of the teapot.
 */
SceneJS.withNode("theScene").start({
    idleFunc: function() {
        SceneJS.withNode("teapot-yaw").inc("angle", 1);
        SceneJS.withNode("teapot-pitch").inc("angle", .3);

        SceneJS.withNode("cube-yaw").inc("angle", .1);
        SceneJS.withNode("cube-pitch").inc("angle", .2);
    }
});

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

        SceneJS.withNode("cube-yaw").set("angle", yaw);
        SceneJS.withNode("cube-pitch").set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);



