/*
 Introductory SceneJS scene which demonstrates enabling/disabling layers.

 In this example, we'll define a scene containing four teapots, each in a seperate layer.

 Then just before we render this scene we'll enable/disable a selection of the layers to
 specify which of them are included in the scene traversal.

 We can specify a priority for layers if we wanted to control the order in which the
 geometries within them are rendered, but for this example we're just specifying the
 default priority of 0 because we're just demonstrating enabling/disabling of layers.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: -5.0, y: 0.0, z: 20.0},
            look : { x : 10.0, y : 0.0, z : 0 },
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
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.8 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 0.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "library",
                            nodes: [
                                {
                                    type: "layer",
                                    id: "teapotLayerNode",
                                    coreId: "teapotLayerCore",
                                    enabled: true
                                },
                                {
                                    type: "layer",
                                    id: "cubeLayerNode",
                                    coreId: "cubeLayerCore",
                                    enabled: true
                                },
                                {
                                    type: "layer",
                                    id: "sphereLayerNode",
                                    coreId: "sphereLayerCore",
                                    enabled: true
                                }
                            ]
                        },

                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 0.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.3,
                            shine:          6.0,

                            nodes: [
                                {
                                    type : "layer",
                                    coreId: "teapotLayerCore",

                                    nodes: [
                                        {
                                            type: "translate",
                                            x : 5,
                                            z : 6,
                                            y: 1,

                                            nodes: [
                                                {
                                                    type: "teapot"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type : "layer",
                                    coreId: "cubeLayerCore",

                                    nodes: [
                                        {
                                            type:"translate",
                                            x : 5,
                                            z : 6,
                                            y: -2,

                                            nodes: [
                                                {
                                                    type: "cube"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type : "layer",
                                    coreId: "sphereLayerCore",

                                    nodes: [
                                        {
                                            type: "translate",
                                            x : 5,
                                            z : 6,

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
                            type: "material",
                            baseColor:      { r: 1.0, g: 0.0, b: 2.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.3,
                            shine:          6.0,

                            nodes: [
                                {
                                    type : "layer",
                                    coreId: "teapotLayerCore",

                                    nodes: [
                                        {
                                            type: "translate",
                                            x : 15,
                                            z : 6,
                                            y: 1,

                                            nodes: [
                                                {
                                                    type: "teapot"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type : "layer",
                                    coreId: "cubeLayerCore",

                                    nodes: [
                                        {
                                            type:"translate",
                                            x : 15,
                                            z : 6,
                                            y: -2,

                                            nodes: [
                                                {
                                                    type: "cube"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type : "layer",
                                    coreId: "sphereLayerCore",

                                    nodes: [
                                        {
                                            type: "translate",
                                            x : 15,
                                            z : 6,

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
});

var scene = SceneJS.scene("theScene");
scene.start();

var cubeLayer = scene.findNode("cubeLayerNode");
var teapotLayer = scene.findNode("teapotLayerNode");
var sphereLayer = scene.findNode("sphereLayerNode");

var i = 0;

setInterval(function() {

    switch (i) {
        case 0:
            cubeLayer.set("enabled", true);
            sphereLayer.set("enabled", false);
            teapotLayer.set("enabled", false);
            i++;
            break;

        case 1:
            cubeLayer.set("enabled", false);
            sphereLayer.set("enabled", true);
            teapotLayer.set("enabled", false);
            i++;
            break;

        case 2:
            cubeLayer.set("enabled", false);
            sphereLayer.set("enabled", false);
            teapotLayer.set("enabled", true);
            i = 0;
            break;
    }
}, 1000);
