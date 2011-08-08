/**
 * SceneJS Example - Basic picking example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */


/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    /* Default: false. If false, once the drawing buffer is presented as described in theDrawing Buffer
     * section, the contents of the drawing buffer are cleared to their default values. All elements of the
     * drawing buffer (color, depth and stencil) are cleared. If the value is true the buffers will not be
     * cleared and will preserve their values until cleared or overwritten by the author.
     * On some hardware setting the preserveDrawingBuffer flag to true can have significant performance implications.
     */

    preserveDrawingBuffer: true,   // http://code.google.com/p/chromium/issues/detail?id=82086

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0, y: 2, z: 22},
            look : { x : 0.0, y : -1.0, z : 0 },
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
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.7, g: 0.7, b: 0.7 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.5, z: -1.0 }
                        },
                        {
                            type: "node",
                            nodes: [
                                {
                                    type: "node",
                                    id: "blue-group",

                                    nodes: [
                                        {
                                            type: "translate",
                                            x: -2,
                                            z: -7,
                                            nodes: [
                                                {
                                                    type: "material",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0,

                                                    nodes: [

                                                        {
                                                            type: "translate",
                                                            x: .5,
                                                            z: -2,

                                                            nodes: [
                                                                {
                                                                    type: "node",
                                                                    id: "left-blue-sphere",

                                                                    nodes: [
                                                                        {
                                                                            type: "sphere"
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    type: "node",
                                                                    id: "right-blue-sphere",

                                                                    nodes: [

                                                                        {
                                                                            type: "translate" ,
                                                                            x: +2,

                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere"
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

                                        {
                                            type: "node",
                                            id: "green-group",

                                            nodes: [
                                                {
                                                    type: "translate",
                                                    x: 3,
                                                    z: 0,

                                                    nodes: [
                                                        {
                                                            type: "material",
                                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "node",
                                                                    id: "left-green-sphere",
                                                                    nodes: [
                                                                        {
                                                                            type: "translate",
                                                                            x: -2,
                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    type: "node",
                                                                    id: "right-green-sphere",

                                                                    nodes: [
                                                                        {
                                                                            type: "translate",
                                                                            x: 1,

                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            id: "red-group",

                                                            nodes : [
                                                                {
                                                                    type: "translate",
                                                                    x: 2,
                                                                    z: +7,

                                                                    nodes: [
                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.9,
                                                                            shine:          6.0,

                                                                            nodes: [
                                                                                {
                                                                                    type: "node",
                                                                                    id: "red-group-sphere",

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "translate",
                                                                                            x: -2,
                                                                                            nodes: [
                                                                                                {
                                                                                                    type: "sphere"
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
                                } ,
                                {
                                    type: "material",
                                    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                    specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                    specular:       0.9,
                                    shine:          6.0,

                                    nodes: [
                                        {
                                            type: "translate",
                                            id: "pickPointer",
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: 0.15,
                                                    y: 0.15,
                                                    z: 0.15,
                                                    nodes: [
                                                        {
                                                            type: "sphere"
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

var pointer = scene.findNode("pickPointer");

/* We can observe when nothing is picked with a "notpicked"
 * listener attached to the scene node:
 */
scene.bind("notpicked",
        function(event) {
            alert("Nothing picked");
        });

/* We'll listen for picking on each of the teapots:
 */

function reportPick(id, event) {
    alert("Picked: '" + id + "' at X=" + event.params.canvasX + ", Y=" + event.params.canvasY + ", Z=" + event.params.canvasZ);
    var worldPos = event.params.worldPos;
     pointer.set({ x: worldPos[0], y:worldPos[1], z: worldPos[2] });
}

scene.findNode("right-blue-sphere").bind("picked",
        function(event) {
            reportPick("right-blue-sphere", event);
        });

scene.findNode("left-blue-sphere").bind("picked",
        function(event) {
            reportPick("left-blue-sphere", event);
        });

scene.findNode("red-group-sphere").bind("picked",
        function(event) {
            reportPick("red-group-sphere", event);
        });

scene.findNode("right-green-sphere").bind("picked",
        function(event) {
            reportPick("right-green-sphere", event);
        });

scene.findNode("left-green-sphere").bind("picked",
        function(event) {
            reportPick("left-green-sphere", event);
        });

scene.start();

var canvas = document.getElementById("theCanvas");

/* On mouse down, we render the scene in picking mode, passing in the
 * mouse canvas coordinates. This will cause a scene render traversal in which
 * all the "picked" listeners will fire on nodes situated above whatever
 * geometry node was picked, as those nodes are visited.
 *
 */
function mouseDown(event) {
    var coords = clickCoordsWithinElement(event);
    scene.pick(coords.x, coords.y, { zPick: true });
}

canvas.addEventListener('mousedown', mouseDown, false);


function clickCoordsWithinElement(event) {
    var coords = { x: 0, y: 0};
    if (!event) {
        event = window.event;
        coords.x = event.x;
        coords.y = event.y;
    } else {
        var element = event.target ;
        var totalOffsetLeft = 0;
        var totalOffsetTop = 0 ;

        while (element.offsetParent)
        {
            totalOffsetLeft += element.offsetLeft;
            totalOffsetTop += element.offsetTop;
            element = element.offsetParent;
        }
        coords.x = event.pageX - totalOffsetLeft;
        coords.y = event.pageY - totalOffsetTop;
    }
    return coords;
}
