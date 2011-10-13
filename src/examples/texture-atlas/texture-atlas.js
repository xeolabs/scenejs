/**
 * Texture atlas example
 * 
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 */

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [

        /*----------------------------------------------------------------------------
         * View and projection
         *---------------------------------------------------------------------------*/

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

                    /*----------------------------------------------------------------------------
                     * Some light sources
                     *---------------------------------------------------------------------------*/

                    nodes: [
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: 0.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: 0.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.2,
                            shine:          6.0,

                            nodes: [


                                /*------------------------------------------------------------------
                                 * Our texture atlas
                                 *
                                 * The atlas is the General Zod portrait and the brickwall pattern,
                                 * arranged side-by-side within the same image file.
                                 *-----------------------------------------------------------------*/

                                {
                                    type: "texture",

                                    layers: [
                                        {
                                            uri:"texture-atlas.jpg",
                                            applyTo:"baseColor",
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

                                                        /*--------------------------------------------------------------
                                                         * Two quads - geometry nodes that define a four-sided polygon.
                                                         *
                                                         * These are arranged on the X-axis by a couple of translate
                                                         * nodes.
                                                         *
                                                         * Each of the quads have different UV coordinates, causing
                                                         * their verices to map to different regions within the texture.
                                                         *
                                                         * The first quad maps to GeneralZod, while second maps to
                                                         * the brick wall.
                                                         *-----------------------------------------------------------------*/

                                                        /* General Zod
                                                         */
                                                        {
                                                            type: "translate",

                                                            x: 1.5,

                                                            nodes: [
                                                                {
                                                                    type: "geometry",
                                                                    positions : [ 1, 1, 0, - 1, 1, 0, -1, -1, 0, 1, -1, 0 ],
                                                                    normals : [ 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1 ],

                                                                    /* UV coords map to left half of texture image
                                                                     */
                                                                    uv : [ 1, 1, .5, 1, .5, 0, 1, 0 ],
                                                                    indices : [ 0, 1, 2,0, 2, 3]
                                                                }
                                                            ]
                                                        },

                                                        /* Brick wall
                                                         */
                                                        {
                                                            type: "translate",

                                                            x: -1.5,

                                                            nodes: [
                                                                {
                                                                    type: "geometry",
                                                                    positions : [ 1, 1, 0, - 1, 1, 0, -1, -1, 0, 1, -1, 0 ],
                                                                    normals : [ 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1 ],

                                                                    /* UV coords map to right half of texture image
                                                                     */
                                                                    uv : [ .5, 1, 0, 1, 0, 0, .5, 0 ],
                                                                    indices : [ 0, 1, 2,0, 2, 3]
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

var scene = SceneJS.scene("theScene");

function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;
        lastX = event.clientX;
        lastY = event.clientY;

        scene.findNode("pitch").set("angle", pitch);
        scene.findNode("yaw").set("angle", yaw);
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

scene.start();
