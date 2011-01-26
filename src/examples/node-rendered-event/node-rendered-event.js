/**
 * Querying the World, View and Canvas-space coordinate origins of scene nodes
 *
 * For each of these teapots we're using a SceneJS utility that uses the JSON API to walk the nodes up the path to
 * the root while gathering the various modelling and viewing matrices we find along the way. As we do that, we're able
 * to determine the center of each teapot on World, View and Canvas space.
 *
 * Using the Canvas space centers, we can then float a DIV over each teapot on the canvas to report its center points.
 *
 * More info on the utility API here: http://scenejs.wikispaces.com/SceneJS.utils
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * October 2010
 *
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
                                                            type: "material",
                                                            baseColor:      { r: 1.0, g: 0.4, b: 0.4 },
                                                            specularColor:  { r: 1.0, g: 0.4, b: 0.4 },
                                                            specular:       0.9,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "teapot"

                                                                }
                                                            ]
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
                                                                    type: "material",
                                                                    baseColor:      { r: 0.4, g: 1.0, b: 0.4 },
                                                                    specularColor:  { r: 0.4, g: 1.0, b: 0.4 },
                                                                    specular:       0.9,
                                                                    shine:          6.0,

                                                                    nodes: [
                                                                        {
                                                                            type: "teapot"

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
        }
    ]
});

var yaw = -0;
var pitch = -00;

SceneJS.withNode("teapot1").bind(
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

SceneJS.withNode("teapot2").bind(
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

SceneJS.withNode("teapot3").bind(
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

SceneJS.withNode("my-scene").start({

    idleFunc: function() {

        SceneJS.withNode("pitch").set("angle", pitch);

        SceneJS.withNode("yaw").set("angle", yaw);

        SceneJS.withNode("my-scene").render();

        yaw += 0.1;
        pitch += 0.1;

        //  sychronizeLabels();
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
