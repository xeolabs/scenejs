/**
 *
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 */
SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: -30.0, y: 0.0, z: 35.0},
            look : { x : 15.0, y : 0.0, z : 0 },
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
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -2.0, y: -1.0, z: 0.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                            specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                            specular:       0.9,
                            shine:          6.0,

                            nodes: [
                                {
                                    type:"translate",
                                    id: "cursor-pos",

                                    nodes: [
                                        {
                                            type: "boundingBox",
                                            id: "teapot-bbox-1",

                                            xmin: -2,
                                            ymin: -2,
                                            zmin: -2,
                                            xmax:  2,
                                            ymax:  2,
                                            zmax:  2,
                                            nodes: [
                                                {
                                                    type: "cube",
                                                    xSize: 2,
                                                    ySize: 2,
                                                    zSize: 2
                                                }
                                            ]
                                        }
                                    ]
                                },

                                {
                                    type:"translate",
                                    y : 15,
                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot 1",
                                            nodes: [
                                                {
                                                    type: "boundingBox",
                                                    id: "teapot-bbox-2",

                                                    xmin: -2,
                                                    ymin: -2,
                                                    zmin: -2,
                                                    xmax:  2,
                                                    ymax:  2,
                                                    zmax:  2,
                                                    nodes: [
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "translate",
                                    y : 5,
                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot 2",
                                            nodes: [
                                                {
                                                    type: "boundingBox",
                                                    id: "teapot-bbox-3",

                                                    xmin: -2,
                                                    ymin: -2,
                                                    zmin: -2,
                                                    xmax:  2,
                                                    ymax:  2,
                                                    zmax:  2,
                                                    nodes: [
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "translate",
                                    y : -5,
                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot 3",
                                            nodes: [
                                                {
                                                    type: "boundingBox",
                                                    id: "teapot-bbox-4",
                                                    xmin: -2,
                                                    ymin: -2,
                                                    zmin: -2,
                                                    xmax:  2,
                                                    ymax:  2,
                                                    zmax:  2,
                                                    nodes: [
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "translate",
                                    y : -15,
                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot 4",
                                            nodes: [
                                                {
                                                    type: "boundingBox",
                                                    id: "teapot-bbox-5",
                                                    xmin: -2,
                                                    ymin: -2,
                                                    zmin: -2,
                                                    xmax:  2,
                                                    ymax:  2,
                                                    zmax:  2,
                                                    nodes: [
                                                        {
                                                            type: "teapot"
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

var dragging = false;
var lastX, lastY;
var x = 0, y = 0, z = 0;

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

        x += (event.clientX - lastX) * 0.1;
        y -= (event.clientY - lastY) * 0.1;

        lastX = event.clientX;
        lastY = event.clientY;

        SceneJS.withNode("cursor-pos").set({
            x: x,
            y: y
        });
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


SceneJS.withNode("teapot-bbox-1")
        .bind("intersect",
        function(e) {
      //      alert(JSON.stringify(e.params.nodeIds));
        });

SceneJS.withNode("theScene").start({
    fps: 60,
    idleFunc: function() {

    }
});
