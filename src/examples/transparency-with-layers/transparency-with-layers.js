/*
 Introductory SceneJS scene which demonstrates the use of layers with transparency blending.

 In this example we have three nested cubes - an inner opaque blue cube, enclosed by a
 transparent red cube, enclosed by an outer transparent green cube.

 When SceneJS blends the cubes with (SRC_ALPHA, ONE_MINUS_SRC_ALPHA), we allocate "layers" to
 the cubes to ensure that they are rendered in the order neccessary for a correct transparency effect.

 On the transparent cubes we cull backfaces because we can't control the render order within a geometry's faces.
 We don't want front faces rendering before back faces, which would cause the back faces to be rejected by the
 depth buffer and deny the opportunity to blend the faces - easy fix is just not to render the backfaces.

 Wiki page on layers: http://scenejs.wikispaces.com/node+-+layer

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: 35.0},
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

                        /*--------------------------------------------------------------------------------------
                         * Light sources which will illuminate the cubes, because they are rendered next
                         * in sequence.
                         *------------------------------------------------------------------------------------*/

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

                                        /*------------------------------------------------------------------------------
                                         * Inner opaque blue cube in "inner-layer"
                                         *----------------------------------------------------------------------------*/

                                        {
                                            type: "material",
                                            baseColor:      { r: 0.0, g: 0.0, b: 1.0 },
                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                            specular:       0.3,
                                            shine:          6.0,

                                            layer: "inner-layer",

                                            nodes: [
                                                {
                                                    type:"scale",
                                                    x: 3,
                                                    y: 3,
                                                    z: 3,

                                                    nodes: [
                                                        {
                                                            type: "cube"
                                                        }

                                                    ]
                                                }
                                            ]
                                        },

                                        /*------------------------------------------------------------------------------
                                         * Transparent red cube in default layer, sandwiched between inner and outer cubes.
                                         *
                                         * See how we cull backfaces because we can't control the order in which faces
                                         * render. We don't want front faces rendering before back faces, which would
                                         * cause the back faces to be rejected by the depth buffer and deny the
                                         * opportunity to blend the faces - easy fix is just to not render the backfaces.
                                         *----------------------------------------------------------------------------*/

                                        {
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                            specular:       0.3,
                                            shine:          6.0,
                                            alpha:          0.2,

                                            flags: {
                                                transparent: true,
                                                backfaces: false    // Hide backfaces
                                            },

                                            // Default layer at order 0

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
                                         * Outer transparent green cube in "outer-layer"
                                         *----------------------------------------------------------------------------*/

                                        {
                                            type: "material",
                                            baseColor:      { r: 0.0, g: 1.0, b: 0.0 },
                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                            specular:       0.3,
                                            shine:          6.0,
                                            alpha:          0.2,

                                            flags: {
                                                transparent: true,
                                                backfaces: false    // Hide backfaces
                                            },


                                            layer: "outer-layer",

                                            nodes: [
                                                {
                                                    type:"scale",
                                                    x: 9,
                                                    y: 9,
                                                    z: 9,

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

/*-------------------------------------------------------------------------------------------
 * Cause the inner cube to render first, then the middle cube in the default layer,
 * then the outer cube. This ensures that when SceneJS blends the cubes with
 * (SRC_ALPHA, ONE_MINUS_SRC_ALPHA), they will be are blended into each other
 * in the order neccessary for a correct transparency effect.
 *-------------------------------------------------------------------------------------------*/

SceneJS.withNode("theScene").set("layers", {
    "inner-layer": -1, // Higher priority than default layer's 0 priority
    "outer-layer":  1  // Lower priority than default layer's 0 priority
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
        pitch += (event.clientY - lastY) * 0.5;
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

