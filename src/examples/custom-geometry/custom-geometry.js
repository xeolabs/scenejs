/*
 This example demonstrates how to define geometry, in this case a simple cube
 object that supports texturing.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 This example assumes that you have looked at a few of the other examples
 and now have an understanding of concepts such as basic SceneJS syntax,
 lighting, material, data flow etc.

 Scroll down to the SceneJS.geometry node about one third of the way down
 this file and I'll guide you from there.

 */


/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createNode({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    flags: {
        backfaces: false
    },

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 55 },
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
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our geometry
                         * by a given angles. The rotate nodes have IDs that we'll locate them with below.
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
                                        {
                                            type: "node",
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
                                                          
                                                            /* Texture scale factors
                                                             */
                                                            scale : {
                                                                x: .1,
                                                                y: .05
                                                            }
                                                        }
                                                    ],

                                                    nodes: [

                                                        /* Aha, here you are, glad you made it!
                                                         *
                                                         * Here is the geometry node which defines our
                                                         * custom object, a simple cube.
                                                         */
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
                                                                0, 0, 1,
                                                                0, 0, 1,
                                                                0, 0, 1,
                                                                0, 0, 1,

                                                                /* v0-v3-v4-v5 right
                                                                 */
                                                                1, 0, 0,
                                                                1, 0, 0,
                                                                1, 0, 0,
                                                                1, 0, 0,

                                                                /* v0-v5-v6-v1 top
                                                                 */
                                                                0, 1, 0,
                                                                0, 1, 0,
                                                                0, 1, 0,
                                                                0, 1, 0,

                                                                /* v1-v6-v7-v2 left
                                                                 */
                                                                -1, 0, 0,
                                                                -1, 0, 0,
                                                                -1, 0, 0,
                                                                -1, 0, 0,

                                                                /* v7-v4-v3-v2 bottom
                                                                 */
                                                                0,-1, 0,
                                                                0,-1, 0,
                                                                0,-1, 0,
                                                                0,-1, 0,

                                                                /* v4-v7-v6-v5 back
                                                                 */
                                                                0, 0,-1,
                                                                0, 0,-1,
                                                                0, 0,-1,
                                                                0, 0,-1
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
                                                                0, 1, 2,
                                                                0, 2, 3,
                                                                // front
                                                                4, 5, 6,
                                                                4, 6, 7,
                                                                // right
                                                                8, 9,10,
                                                                8,10,11,
                                                                // top
                                                                12,13,14,
                                                                12,14,15,
                                                                // left
                                                                16,17,18,
                                                                16,18,19,
                                                                // bottom
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
        pitch += (event.clientY - lastY) * 0.5;

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {

    SceneJS.withNode("pitch").set("angle", pitch);
    SceneJS.withNode("yaw").set("angle", yaw);
    SceneJS.withNode("the-scene").render();
};

/* Render loop until error or reset
 * (which IDE does whenever you hit that run again button)
 */
var pInterval;

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);







