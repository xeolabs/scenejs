/*

 Demonstrates sharing node cores, a technique borrowed from OpenSG

 https://github.com/xeolabs/scenejs/wiki/Node-Cores

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */


/*
 * Not central to this demo, but just for testing completeness, one of our geometry nodes
 * will load through an IoC service.
 *
 * https://github.com/xeolabs/scenejs/wiki/GeoLoader-Service
 *
 * Define a stub geometry stream service that just provides a mock "stream" through which
 * a simple cube geometry data is available. We'll reference the stream with a geometry node
 * within our scene graph, further below.
 */
SceneJS.Services.addService(SceneJS.Services.GEO_LOADER_SERVICE_ID, {
    loadGeometry : function(id, callback) {
        if (id == "my-geo-stream") {
            callback({
                primitive   : "triangles",
                positions   : new Float32Array([  5, 5, 5,-5, 5, 5,-5,-5, 5,5,-5, 5,5, 5, 5,5,-5, 5,5,-5,-5,5, 5,-5,5, 5, 5,5, 5,-5,-5, 5,-5,-5, 5, 5, -5, 5, 5,-5, 5,-5,-5,-5,-5,-5,-5, 5,-5,-5,-5,5,-5,-5,5,-5, 5,-5,-5, 5,5,-5,-5,-5,-5,-5,-5, 5,-5, 5, 5,-5]),
                normals     : new Float32Array([  0, 0, 1, 0, 0, 1,  0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0,-1, 0, 0, -1, 0, 0,  0,-1, 0, 0,-1, 0,  0,-1, 0, 0,-1, 0, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1]),
                uv          : new Float32Array([  5, 5,0, 5,0, 0, 5, 0,  0, 5,0, 0,5, 0,5, 5,5,0,5, 5,0, 5,0, 0,5,5,0, 5,0, 0,5, 0,0, 0,5,0,5,5,0,5,0,0,5,0,5,5,0,5]),
                uv2         : null,
                indices     : new Int32Array([ 0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9,10, 8,10,11,12,13,14, 12,14,15,16,17,18,16,18,19,20,21,22,20,22,23])
            });
        } else {
            throw SceneJS_errorModule.fatalError("Internal error - can't find geometry stream: '" + id + "'");
        }
    }
});


/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createScene({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    flags: {
        backfaces: false
    },

    nodes: [


        /*-----------------------------------------------------------------------------------------
         *  Node core library
         *---------------------------------------------------------------------------------------*/

        {
            type: "library",
            nodes: [

                /*-------------------------------------------------
                 *  Loookat and camera node cores
                 *------------------------------------------------*/

                {
                    type: "lookAt",
                    coreId: "my-lookat-core",
                    eye : { x: 0.0, y: 10.0, z: 55 },
                    look : { y:1.0 },
                    up : { y: 1.0 }
                },

                {
                    type: "camera",
                    coreId: "my-camera-core",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    }
                },

                /*-------------------------------------------------
                 *  Light node cores
                 *------------------------------------------------*/

                {
                    type: "light",
                    coreId: "my-light-core-1",
                    mode: "dir",
                    color: { r: 0.8, g: 0.8, b: 0.8 },
                    dir:   { x: 1.0, y: -0.5, z: -1.0 }
                },

                {
                    type: "light",
                    coreId: "my-light-core-2",
                    mode: "dir",
                    color: { r: 0.8, g: 0.8, b: 0.8 },
                    dir:   { x: 1.0, y: -1.0, z: -1.0 }
                },

                /*-------------------------------------------------
                 *  Rotate node cores
                 *------------------------------------------------*/

                {
                    type: "rotate",
                    coreId: "my-rotate-core-1",
                    angle: 30.0,
                    x : 1.0
                },

                {
                    type: "rotate",
                    coreId: "my-rotate-core-2",
                    angle: -30.0,
                    y : 1.0
                },

                /*-------------------------------------------------
                 *  Geometry cores
                 *------------------------------------------------*/

                {
                    type: "geometry",
                    id: "my-geometry",
                    coreId: "my-geometry-core-1",

                    primitive: "triangles",
                    positions : [
                        5, 5, 5,-5, 5, 5,-5,-5, 5,5, -5, 5, 5, 5, 5, 5,-5, 5, 5,-5,-5, 5, 5,-5,
                        5, 5, 5, 5, 5,-5,-5, 5,-5,-5, 5, 5, -5, 5, 5,-5, 5,-5,-5,-5,-5,-5,-5, 5,
                        -5,-5,-5, 5,-5,-5, 5,-5, 5,-5,-5, 5, 5,-5,-5,-5,-5,-5,-5, 5,-5, 5, 5,-5
                    ],
                    normals : [
                        0, 0, 1, 0, 0, 1,  0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0,  1, 0, 0, 1, 0, 0,
                        0, 1, 0, 0, 1, 0,  0, 1, 0, 0, 1, 0,-1, 0, 0, -1, 0, 0, -1, 0, 0,-1, 0, 0,
                        0,-1, 0, 0,-1, 0,0,-1, 0, 0,-1, 0, 0, 0,-1, 0, 0,-1, 0, 0,-1,0, 0,-1
                    ],
                    uv : [
                        5, 5, 0, 5, 0, 0, 5, 0, 0, 5, 0, 0, 5, 0,5, 5, 5, 0, 5, 5,0, 5,0, 0,
                        5, 5,0, 5, 0, 0,5, 0, 0, 0,5, 0, 5, 5, 0, 5, 0, 0,5, 0, 5, 5, 0, 5
                    ],
                    indices : [
                        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9,10, 8,10,11,
                        12,13,14,12,14,15,16,17,18, 16,18,19, 20,21,22, 20,22,23
                    ]
                },

                /* This geometry loads through the loading service we defined earlier
                 */
                {
                    type: "geometry",
                    id: "my-geometry-2",
                    coreId: "my-geometry-core-2",
                    stream: "my-geo-stream"
                },


                /*-------------------------------------------------
                 *  Material core
                 *------------------------------------------------*/

                {
                    type: "material",
                    id: "my-material",
                    coreId: "my-material-core",

                    baseColor:      { r: 1.0, g: 1.0, b: 0.0 },
                    specularColor:  { r: 0.4, g: 0.4, b: 0.4 },
                    specular:       0.2,
                    shine:          6.0
                },

                /*-------------------------------------------------
                 *  Texture core
                 *------------------------------------------------*/

                {
                    type: "texture",
                    id: "my-texture",
                    coreId: "my-texture-core",

                    layers: [
                        {
                            uri:"../web/images/BrickWall.jpg" ,
                            applyTo: "baseColor",
                            blendMode: "multiply",
                            scale : { // Texture scale factors
                                x: .1,
                                y: .05
                            }
                        }
                    ]
                }
            ]
        },

        /*----------------------------------------------------------------------
         * Node core usages
         *---------------------------------------------------------------------*/

        {
            type: "lookAt",
            coreId: "my-lookat-core",

            nodes: [

                {
                    type: "camera",
                    coreId: "my-camera-core",

                    nodes: [

                        {
                            type: "light",
                            coreId: "my-light-core-1"
                        },

                        {
                            type: "light",
                            coreId: "my-light-core-2"
                        },

                        {
                            type: "rotate",
                            id: "pitch",
                            coreId: "my-rotate-core-1",

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    coreId: "my-rotate-core-2",

                                    nodes: [
                                        {
                                            type: "material",
                                            coreId: "my-material-core",

                                            nodes: [

                                                {
                                                    type: "texture",
                                                    coreId: "my-texture-core",

                                                    nodes: [
                                                        {
                                                            type: "translate",
                                                            x: -7,
                                                            nodes: [
                                                                {
                                                                    type: "geometry",
                                                                    coreId: "my-geometry-core-1"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: 7,
                                                    nodes: [
                                                        {
                                                            type: "geometry",
                                                            coreId: "my-geometry-core-2"
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

var scene = SceneJS.scene("the-scene");

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * 0.5;

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





