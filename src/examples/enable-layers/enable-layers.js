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
SceneJS.createNode({
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

                                /*--------------------------------------------------------------------------------------
                                 * Define our teapots, each in a seperate layer. Then just before we render this
                                 * scene we'll enable/disable a selection of the layers to include/exclude some
                                 * teapots from the scene traversal.
                                 *------------------------------------------------------------------------------------*/

                                {
                                    type:"translate",
                                    y : 15,
                                    layer: "example-layer-1",

                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot in layer 'example-layer-1'",
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
                                    y : 5,
                                    layer: "example-layer-2",

                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot in layer 'example-layer-2'",
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
                                    y : -5,
                                    layer: "example-layer-3",

                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot in layer 'example-layer-3'",
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
                                    y : -15,
                                    layer: "example-layer-4",

                                    nodes: [
                                        {
                                            type: "text",
                                            size: 80,
                                            text: "     Teapot in layer 'example-layer-4'",
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
});


/*-------------------------------------------------------------------------------------------
 * Enable three of the layers, all rendering at the default SceneJS priority of 0.
 *
 * There is no real use for rendering priorities in this example, so we're just specifying
 * them as 0.
 *
 * One situation in which might care about priorities is when we want to control the
 * order in which layers are blended with one another. We'll look at that sort of thing in other
 * layering examples. This example just shows how to enable/disable layers.
 *
 * Try commenting/uncommenting some of these layers to see the teapots appear/disappear.
 *-------------------------------------------------------------------------------------------*/

SceneJS.withNode("theScene").set("layers", {
    "example-layer-1": 0,
    //  "example-layer-2": 0,
    "example-layer-3": 0,
    "example-layer-4": 0

});

SceneJS.withNode("theScene").render();
