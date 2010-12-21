/*
 Mesh morphing demo



 */


/*----------------------------------------------------------------------
 * Define a simple scene graph containing a box
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
                                         *
                                         *----------------------------------------------------------------------------*/
                                        {
                                            type: "node",
                                            id: "my-morph",
                                            positions: [

                                            ],

                                            nodes:[


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

                                                                        /*----------------------------------------------------------------------
                                                                         * The cube we're morphing
                                                                         *--------------------------------------------------------------------*/
                                                                        {

                                                                            type: "geometry",

                                                                            /* Optional resource name, must be unique among all
                                                                             * geometries - if another geometry has already
                                                                             * been defined with this resource type, then that
                                                                             * geometry will be instanced here in place of
                                                                             * this one, and this geometry definition will be
                                                                             * ignored. This supports dynamic instancing,
                                                                             * where we may reuse the same geometry in
                                                                             * many places to save memory.
                                                                             */
                                                                            resource: "my-geometry",

                                                                            /* The primitive type - allowed values are
                                                                             * "points", "lines", "line-loop", "line-strip",
                                                                             * "triangles", "triangle-strip" and "triangle-fan".
                                                                             *
                                                                             * Try setting this config to these different
                                                                             * types, it's quite freaky.
                                                                             *
                                                                             * See the OpenGL/WebGL specification docs for
                                                                             * how the coordinate arrays are supposed to be laid out
                                                                             * for them.
                                                                             */
                                                                            primitive: "triangles",

                                                                            /* The vertices - eight for our cube, each
                                                                             * one spaining three array elements for X,Y and Z
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

                                                                            /* Indices - these organise the
                                                                             * positions and uv texture coordinates
                                                                             * into geometric primitives in accordance
                                                                             * with the "primitive" parameter,
                                                                             * in this case a set of three indices
                                                                             * for each triangle.
                                                                             *
                                                                             * Note that each triangle is specified
                                                                             * in counter-clockwise winding order.
                                                                             *
                                                                             * You can specify them in clockwise
                                                                             * order if you configure the SceneJS.renderer
                                                                             * node's frontFace property as "cw", instead of
                                                                             * the default "ccw".
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
                                                                                8,10,11,

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
        }
    ]
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





