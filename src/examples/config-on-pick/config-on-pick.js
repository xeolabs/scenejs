/**
 * SceneJS Example - Basic picking
 *
 * This is a basic example that shows how picking can be used with a SceneJS.WithConfigs node.
 *
 * The WithConfigs node listens for "picked" events on its subgraph, handling them by either pushing new
 * configurations down into the subgraph or replacing nodes, depending on the origin of the event.
 *
 * Scroll down to the WithConfigs node for more details.
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */

SceneJS.createNode({
    type: "scene",
    id: "my-scene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0, y: 2, z: -40},
            look : { x : 0.0, y : 5.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 45.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },

                        /*
                         * When "teapot1" is picked, we'll push a new angle at
                         * its "teapot1-rotate" node to spin it around
                         */
                        {
                            type: "node",
                            id: "teapot1",

                            nodes: [
                                {
                                    type: "translate",
                                    x: 7,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "teapot1-rotate",
                                            y: 1,
                                            angle: 0.0,

                                            nodes: [
                                                {
                                                    type: "material",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
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
                        },


                        /*
                         * "teapot2" subgraph - note the "remove-from-here" and "remove-me" nodes, which are there
                         * to enable us to remove the latter from the former when this is picked.
                         */

                        {
                            type: "node",
                            id : "teapot2",
                            nodes : [
                                {
                                    type: "material",
                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0,
                                    nodes: [
                                        {
                                            type: "node",
                                            id: "remove-from-here",
                                            nodes: [
                                                {
                                                    type: "node",
                                                    id: "remove-me",
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
                        },


                        /*
                         * "teapot3"
                         */

                        {
                            type: "node",
                            id: "teapot3",
                            nodes: [
                                {
                                    type: "translate",
                                    x: -7,
                                    nodes: [
                                        {
                                            type: "material",
                                            id: "teapot3-material1",

                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0,
                                            nodes: [
                                                {
                                                    id: "teapot3-object",
                                                    type: "teapot"
                                                }
                                            ]
                                        },
                                        {
                                            type: "material",
                                            id: "teapot3-material2",

                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0
                                        }
                                    ]
                                }
                            ]
                        },

                        /*
                         * "teapot4"
                         */

                        {
                            type: "node",
                            id: "teapot4",
                            nodes: [
                                {
                                    type: "node",
                                    id: "mount-point",
                                    nodes: [
                                        {
                                            type: "translate",
                                            x: -14 ,
                                            nodes: [
                                                {
                                                    type: "material",
                                                    id: "teapot4-color",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0,
                                                    nodes: [
                                                        {
                                                            type: "translate",
                                                            id: "teapot4-pos",
                                                            nodes: [
                                                                {
                                                                    type: "rotate",
                                                                    id: "teapot4-spin",
                                                                    y: 1.0 ,
                                                                    nodes: [
                                                                        {
                                                                            type: "rotate",
                                                                            id: "teapot4-tumble",
                                                                            z: 1.0,
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
        }
    ]
});


SceneJS.withNode("teapot1").bind("picked",
        function(event) {
            SceneJS.withNode("teapot1-rotate").set("angle", 60);
        });

SceneJS.withNode("teapot2").bind("picked",
        function(event) {
            SceneJS.withNode("remove-from-here").remove("nodes", "remove-me");
        });

SceneJS.withNode("teapot3").bind("picked",
        function(event) {
            SceneJS.Message.sendMessage({
                command: "update",
                target: "teapot3-material1",
                remove: {
                    node: "teapot3-object"
                },
                messages: [
                    {
                        command: "update",
                        target:"teapot3-material2",
                        add: {
                            node: "teapot3-object"
                        }
                    }
                ]
            });
        });

SceneJS.withNode("teapot4").bind("picked",
        function(event) {
            this.add("nodes", [
                {
                    type: "interpolator",
                    target: "teapot4-pos",
                    targetProperty: "x",
                    keys: [0, 3, 6],
                    values: [0, 20, 15]
                },
                {
                    type: "interpolator",
                    target: "teapot4-pos",
                    targetProperty: "y",
                    keys: [0, 3],
                    values: [0, 3]
                },
                {
                    type: "interpolator",
                    target: "teapot4-pos",
                    targetProperty: "z",
                    keys: [0, 6],
                    values: [0, -30]
                },
                {
                    type: "interpolator",
                    target: "teapot4-tumble",
                    targetProperty: "angle",
                    keys: [0, 6],
                    values: [0, 720]
                },
                {
                    type: "interpolator",
                    target: "teapot4-spin",
                    targetProperty: "angle",
                    keys: [0, 6],
                    values: [0, 720]
                }
            ]);
        });

var pInterval;

var x = 0;
window.render = function() {
    SceneJS.withNode("my-scene").render();
};

SceneJS.bind("error", function(e) {
    window.clearInterval(pInterval);
    alert(e.exception.message ? e.exception.message : e.exception);
});

pInterval = setInterval("window.render()", 10);

var canvas = document.getElementById("theCanvas");

canvas.addEventListener(
        'mousedown',
        function (event) {
            SceneJS.withNode("my-scene").pick(event.offsetX, event.offsetY);
        }, true);

