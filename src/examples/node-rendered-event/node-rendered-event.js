/**
 * Querying node World, View and Canvas-space origins via a "rendered" event
 *
 * For each of these teapots we're listening to "rendered" events on their scene nodes, which report
 * their centre points in various coordinate systems, along with the Model, View and Projection matrices
 * that are applied to them.
 *
 * Using the Canvas space centers, we can then float a DIV over each teapot on the canvas to report its center points.
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * October 2010
 *
 */

SceneJS.createScene({
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
                                                            type: "material",
                                                            baseColor:      { r: 1.0, g: 0.4, b: 0.4 },
                                                            specularColor:  { r: 1.0, g: 0.4, b: 0.4 },
                                                            specular:       0.9,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "teapot",
                                                                    id: "teapot-geometry"

                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "rotate",
                                                    id: "pitch",
                                                    angle: -40.0,
                                                    x : 1.0,

                                                    nodes: [

                                                        {
                                                            type: "translate",
                                                            z : -20.0,
                                                            id: "teapot2",

                                                            nodes: [
                                                                {
                                                                    type: "material",
                                                                    baseColor:      { r: 0.4, g: 1.0, b: 0.4 },
                                                                    specularColor:  { r: 0.4, g: 1.0, b: 0.4 },
                                                                    specular:       0.9,
                                                                    shine:          6.0,

                                                                    nodes: [
                                                                        {
                                                                            type: "teapot",
                                                                            id: "teapot2-geometry"

                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            type: "translate",
                                                            z : 20.0,
                                                            id: "teapot3",

                                                            nodes: [
                                                                {
                                                                    type: "material",
                                                                    baseColor:      { r: 0.4, g: 0.4, b: 1.0 },
                                                                    specularColor:  { r: 0.4, g: 0.4, b: 1.0 },
                                                                    specular:       0.9,
                                                                    shine:          6.0,

                                                                    nodes: [
                                                                        {
                                                                            type: "teapot",
                                                                            id: "teapot3-geometry"

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

var scene = SceneJS.scene("my-scene");

var yaw = -0;
var pitch = -40;

scene.findNode("teapot1").bind(
        "rendered",
        function (event) {
            var params = event.params;

            updateLabelPos(
                    "teapot1",
                    params.getCanvasPos(),
                    params.getProjPos(),
                    params.getCameraPos(),
                    params.getViewPos(),
                    params.getWorldPos());
        });

scene.findNode("teapot2").bind(
        "rendered",
        function (event) {
            var params = event.params;
            updateLabelPos(
                    "teapot2",
                    params.getCanvasPos(),
                    params.getProjPos(),
                    params.getCameraPos(),
                    params.getViewPos(),
                    params.getWorldPos());
        });

scene.findNode("teapot3").bind(
        "rendered",
        function (event) {
            var params = event.params;
            updateLabelPos(
                    "teapot3",
                    params.getCanvasPos(),
                    params.getProjPos(),
                    params.getCameraPos(),
                    params.getViewPos(),
                    params.getWorldPos());
        });

scene.start({

    idleFunc: function() {

        scene.findNode("pitch").set("angle", pitch);
        scene.findNode("yaw").set("angle", yaw);

        yaw += 0.1;
        pitch += 0.1;
    }
});


function updateLabelPos(elementId, canvasPos, projPos, cameraPos, viewPos, worldPos) {

    var offset = $("#theCanvas").offset();

    $("#" + elementId).html(elementId
            + "<br/>"
            + "<br/>Canvas: " + Math.round(canvasPos.x) + ", " + Math.round(canvasPos.y)
            + "<br/>Proj  : " + Math.round(projPos.x) + ", " + Math.round(projPos.y)
            + "<br/>Camera  : " + roundFloat(cameraPos.x) + ", " + roundFloat(cameraPos.y) + ", " + roundFloat(cameraPos.z)
            + "<br/>View  : " + roundFloat(viewPos.x) + ", " + roundFloat(viewPos.y) + ", " + roundFloat(viewPos.z)
            + "<br/>World : " + roundFloat(worldPos.x) + ", " + roundFloat(worldPos.y) + ", " + roundFloat(worldPos.z)
            );

    $("#" + elementId).css("left", offset.left + canvasPos.x);
    $("#" + elementId).css("top", offset.top + canvasPos.y);
}

function roundFloat(v) {
    return Math.round(v * 10) / 10;
}
