/*
 Mesh deformation demo

 In this example we'll define six deformation points around a teapot, then animate
 the weights of those points in a funky sinusoidal ripple to make the teapot wobble.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

/*----------------------------------------------------------------------
 * Define a a red sphere symbol which we'll use to indicate
 * the position of each deformation control point
 *---------------------------------------------------------------------*/
SceneJS.createNode({
    type: "material",
    id: "control-point-sphere",
    emit: 0,
    baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
    specularColor:  { r: 1.0, g: 0.0, b: 0.0 },
    specular:       0.9,
    shine:          100.0,

    nodes: [

        {
            type: "scale",
            x:.1,
            y:.1,
            z:.1,

            nodes: [
                {
                    type : "sphere"
                }
            ]
        }
    ]
});

/*----------------------------------------------------------------------
 * Define a simple scene graph containing a blue teapot
 *---------------------------------------------------------------------*/

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

    nodes:[

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [

                /* Camera describes the projection
                 */
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

                        /* A lights node inserts  point lights into the world-space.
                         * You can have many of these, nested within modelling transforms
                         * if you want to move them around.
                         */
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },


                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
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
                                    angle: -30.0,
                                    y : 1.0,

                                    nodes: [

                                        /*-----------------------------------------------------------------------------
                                         * Spheres indicating the locations or our deform's control points
                                         *----------------------------------------------------------------------------*/
                                        {
                                            type: "translate",
                                            x:    -4.0,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "control-point-sphere"
                                                }
                                            ]
                                        },
                                        {
                                            type: "translate",
                                            x:    4.0,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "control-point-sphere"
                                                }

                                            ]
                                        },
                                        {
                                            type: "translate",
                                            y: 4.0,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "control-point-sphere"
                                                }

                                            ]
                                        },
                                        {
                                            type: "translate",
                                            y: -4.0,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "control-point-sphere"
                                                }

                                            ]
                                        },
                                        {
                                            type: "translate",
                                            z: 4.0,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "control-point-sphere"
                                                }

                                            ]
                                        },
                                        {
                                            type: "translate",
                                            z: -4.0,
                                            nodes: [
                                                {
                                                    type: "instance",
                                                    target: "control-point-sphere"
                                                }

                                            ]
                                        },

                                        /*-----------------------------------------------------------------------------
                                         * With a deformation node we'll define six control points around
                                         * the teapot. These each have a positive weight with an
                                         * exponential mode, causing them to repel eache vertex of the
                                         * teapot by an amount that is in exponential inverse proportion
                                         * to their distance from the vertex.
                                         *
                                         * We'll animate their weights, causing them to oscillate smoothly
                                         * between positive and negative values, which will stretch and compress
                                         * the teapot.
                                         *
                                         * You can define as many control points as you want - note that while
                                         * adding and removing then in a live scene graph has a performance overhead
                                         * because a shader must be recompiled each time.
                                         *
                                         * Each deform vertex has an "exp" mode specifying that its attraction/repulsion
                                         * force on each teapot position decreases exponentially in proportion to distance,
                                         * like gravity.
                                         *
                                         * We could instead define their modes as "linear", causing their effect to
                                         * decrease linearly in proportion to distance
                                         *----------------------------------------------------------------------------*/
                                        {
                                            type: "deform",
                                            id: "my-deform",
                                            verts: [
                                                {
                                                    x: 4.0,
                                                    y: 0,
                                                    z: 0,
                                                    mode: "exp",
                                                    weight: 4
                                                },
                                                {
                                                    x: -4.0,
                                                    y: 0,
                                                    z:  0,
                                                    mode: "exp",
                                                    weight:  4
                                                },
                                                {
                                                    x: 0,
                                                    y: -4.0,
                                                    z:  0,
                                                    mode: "exp",
                                                    weight:  4
                                                },
                                                {
                                                    x: 0,
                                                    y: 4.0,
                                                    z:  0,
                                                    mode: "exp",
                                                    weight:  4
                                                },
                                                {
                                                    x: 0,
                                                    y: 0,
                                                    z:  4.0,
                                                    mode: "exp",
                                                    weight:  4
                                                },
                                                {
                                                    x: 0,
                                                    y: 0,
                                                    z: -4.0,
                                                    mode: "exp",
                                                    weight:  4
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },


                        /*----------------------------------------------------------------------
                         * The teapot we're deforming
                         *--------------------------------------------------------------------*/

                        {
                            type: "material",
                            emit: 0,
                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                            specular:       0.9,
                            shine:          100.0,

                            nodes: [
                                {
                                    type: "translate",
                                    y: -1,

                                    nodes: [
                                        {
                                            type: "scale",
                                            x:.7,
                                            y:.7,
                                            z:.7,

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

});


/*----------------------------------------------------------------------
 * To illustrate the API, here's how to update, add and delete vertices
 * from the deform node.
 *
 * Note that adding and removing vertices is best avoided while
 * running a scene graph because it causes a new shader to be generated
 * each time - rather inefficient.
 *---------------------------------------------------------------------*/

/*
 SceneJS.withNode("my-deform").set("vert", {
 index: 0,
 x: -4.0,
 y: 0,
 z: 0,
 mode: "exp",
 weight: 6
 });
 */

/*
 SceneJS.withNode("my-deform").add("vert", {
 x: 0,
 y: -5,
 z: 0,
 weight: -3
 });
 */

/*
 SceneJS.withNode("my-deform").remove("vert", {
 index: 2
 });
 */

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

var yaw = -30;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var w = 0;
var toggle = 0.01;
var count = 0;

/* Start the scene graph - in each frame, we'll update the
 * weights of the deform's control points in a funky sinusoidal ripple:
 */
SceneJS.withNode("theScene").start({
    idleFunc: function() {
        SceneJS.withNode("my-deform").set("vert", {
            index: 0,
            weight: Math.sin(w) * 2.0
        });

        SceneJS.withNode("my-deform").set("vert", {
            index: 1,
            weight: Math.sin(w + 1) * 2.0
        });

        SceneJS.withNode("my-deform").set("vert", {
            index: 2,
            weight: Math.sin(w + 2) * 2.0
        });

        SceneJS.withNode("my-deform").set("vert", {
            index: 3,
            weight: Math.sin(w + 3) * 2.0
        });

        SceneJS.withNode("my-deform").set("vert", {
            index: 4,
            weight: Math.sin(w + 4) * 2.0
        });

        SceneJS.withNode("my-deform").set("vert", {
            index: 5,
            weight: Math.sin(w + 5) * 2.0
        });

        w += 0.1;
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

        SceneJS.withNode("yaw").set("angle", yaw);
        SceneJS.withNode("pitch").set("angle", pitch);

        SceneJS.withNode("theScene").render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);





