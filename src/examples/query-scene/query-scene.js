/**
 * SceneJS Example - Switchable Geometry using the Selector Node.
 *
 * A Selector node is a branch node that selects which among its children are currently active.
 *
 * In this example, a Selector contains four Teapot nodes, of which it initially selects the first,
 * second and fourth. By editing its "selection" property, you can change which of the Teapots
 * are rendered.
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 */
SceneJS.createNode({
    type: "scene",
    id: "my-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: -0.0, y: 0.0, z: -35.0},
            look : { x : 0.0, y : 0.0, z : 0 },
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
                            dir:                    { x: -2.0, y: -1.0, z: -1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                            specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                            specular:       0.9,
                            shine:          6.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            type: "translate",
                                            x : -20.0,

                                            nodes: [
                                                {
                                                    type: "node",
                                                    id: "teapot1",

                                                    nodes: [
                                                        {
                                                            type: "teapot"

                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "rotate",
                                                    id: "pitch",
                                                    angle: 0.0,
                                                    x : 1.0,

                                                    nodes: [

                                                        {
                                                            type: "translate",
                                                            z : -20.0,
                                                            id: "teapot2",

                                                            nodes: [
                                                                {
                                                                    type: "teapot"

                                                                }
                                                            ]
                                                        },
                                                        {
                                                            type: "translate",
                                                            z : 20.0,
                                                            id: "teapot3",

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
        }
    ]
});

SceneJS.withNode("my-scene").render();

var canvas = document.getElementById("theCanvas");

canvas.addEventListener(
        'mousedown',
        function (event) {
            SceneJS.withNode("my-scene").pick(event.offsetX, event.offsetY);
        }, true);

SceneJS.withNode("teapot1").bind(
        "picked",
        function(event) {
            var nodeId = this.get("ID");
            queryPos(nodeId);
        });

SceneJS.withNode("teapot2").bind(
        "picked",
        function(event) {
            var nodeId = this.get("ID");
            queryPos(nodeId);
        });

/** Returns the world-space position the node with the given ID
 */
function queryPos(nodeId) {
    var node = SceneJS.withNode(nodeId);
    var info = walkUpBranch(node, null);
    alert("Node '" + nodeId + "' positions:\nworld=" + info.worldPos + "\nview=" + info.viewPos + "\ncanvas=" + info.canvasPos);
}

/**
 * Recursively walks up a parent path of node selectors
 * and returns the world-space position of the starting (leaf) node
 * as soon as the path encounters a "library" node or the scene root
 */
function walkUpBranch(node, info) {
    if (!info) {
        info = {
            worldPos : [0,0,0]
        };
    }
    var mat;
    var type = node.get("type");
    switch (type) {
        case "rotate":
        case "translate":
        case "scale":
        case "matrix":
        case "quaternion":
            mat = node.get("matrix");
            info.worldPos = transformPoint3(mat, info.worldPos);
            break;

        case "lookAt":
            var viewMat = node.get("matrix");

            info.viewMat = viewMat;
            info.viewPos = transformPoint3(viewMat, info.worldPos);

            if (info.projMat) {
                info.projPos = transformPoint3(info.projMat, info.viewPos);
            } else {
                info.projPos = info.viewPos;
            }
            break;

        case "camera":
            mat = node.get("matrix");
            info.projMat = mat;
            break;

        case "scene":

            /* Get canvas extents
             */
            var canvas = document.getElementById(node.get("canvasId"));
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            var projPos = info.projPos;

            /* Projection division
             */
            var x = projPos[0] / projPos[3];
            var y = projPos[1] / projPos[3];

            /* Map to canvas
             */
            x *= width;
            y *= height;

            info.canvasPos = [x, y];
            break;

        case "library":

            /* Just to illustrate the case in which the query target
             * node is within a library subtree, in which case we
             * are only interested in whatever origins we can get relative
             *  to the library node
             */
            return info;
    }

    var parent = node.parent();
    if (parent) {
        info = walkUpBranch(parent, info);
    }
    return info;
}

function transformPoint3(mat, p) {
    return [
        (mat[0] * p[0]) + (mat[4] * p[1]) + (mat[8] * p[2]) + mat[12],
        (mat[1] * p[0]) + (mat[5] * p[1]) + (mat[9] * p[2]) + mat[13],
        (mat[2] * p[0]) + (mat[6] * p[1]) + (mat[10] * p[2]) + mat[14],
        (mat[3] * p[0]) + (mat[7] * p[1]) + (mat[11] * p[2]) + mat[15]
    ];
}

var yaw = -0;
var pitch = -00;

window.render = function() {
    SceneJS.withNode("pitch").set("angle", pitch);
    SceneJS.withNode("yaw").set("angle", yaw);

    SceneJS.withNode("my-scene").render();

    yaw += 0.3;
    pitch += 0.2;
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 10)
