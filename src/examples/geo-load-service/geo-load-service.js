/*
 This example shows how to define and use a GeoLoaderService to customize how geometry is loaded. We'll just
 implement a stub of the service in this example, which should give you enough clues for define your own implementation.

 Wiki article:

 https://github.com/xeolabs/scenejs/wiki/GeoLoader-Service

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 This example assumes that you have looked at a few of the other examples
 and now have an understanding of concepts such as basic SceneJS syntax,
 lighting, material, data flow etc.
 */

/* Define a stub geometry stream service that just provides a mock "stream" through which a simple cube geometry data
 * is available. We'll reference the stream with a geometry node within our scene graph, further below.
 */

function MyGeoLoader() {

    this.loadGeometry = function(id, callback) {
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
    };
}

/* Register the service implementation
 */
SceneJS.Services.addService(SceneJS.Services.GEO_LOADER_SERVICE_ID, new MyGeoLoader());


/* Scene graph containing geometry that pulls in the stream
 */
SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

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
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               false,
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
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0,

                                            nodes: [
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        {
                                                            uri:"../web/images/BrickWall.jpg",
                                                            blendMode: "multiply",
                                                            scale : {
                                                                x: .1,
                                                                y: .05
                                                            }
                                                        }
                                                    ],

                                                    nodes: [

                                                        {
                                                            type: "geometry",

                                                            /* Our GeoLoaderService implementation resolves this to the
                                                             * available stream
                                                             */
                                                            stream: "my-geo-stream"
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

var scene = SceneJS.scene("theScene");
var pitchRotate = scene.findNode("pitch");
var yawRotate = scene.findNode("yaw");

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

        pitchRotate.set("angle", pitch);
        yawRotate.set("angle", yaw);
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

scene.start();










