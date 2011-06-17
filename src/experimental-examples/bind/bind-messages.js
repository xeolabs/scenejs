/**
 * SceneJS Example - Binding Messages to Triggers
 *
 * The Message API from V0.7.9 onwards allows us to specify messages to be automatically sent whenever given trigger
 * conditions occur. A trigger may be the elapse of a given time interval, or the occurrence of some observed event
 * within SceneJS. For each trigger condition, we can specify whether the message is sent once for the first occurrence
 * of the trigger, or every time the trigger occurs.
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * November 2010
 */
SceneJS.createScene({
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
                         * Teapot 1
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
                                                    id: "teapot1-material",
                                                    baseColor:      { r: 0.6, g: 0.3, b: 0.3 },
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
                         * Teapot 2
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
                         * Teapot 3
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
                         * Teapot 4
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
                        },

                        /*
                         * Teapot 5
                         */
                        {
                            type: "node",
                            id : "teapot5",
                            nodes : [
                                {
                                    type: "renderer",
                                    id: "teapot5-renderer",

                                    // We'll toggle this on pick

                                    highlight: false,

                                    nodes: [
                                        {
                                            type: "material",
                                            baseColor:          { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:      { r: 0.9, g: 0.9, b: 0.9 },

                                            // Color for highlight mode

                                            highlightBaseColor: { r: 1.0, g: 1.0, b: 0.3 },
                                            specular:           0.9,
                                            shine:              6.0,
                                            nodes: [
                                                {
                                                    type: "translate",
                                                    x   : 7,
                                                    y   : -7,
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
                         * Teapot 6
                         */
                        {
                            type: "node",
                            id : "teapot6",
                            nodes : [
                                {
                                    type: "renderer",
                                    id: "teapot6-renderer",

                                    // We'll toggle this on pick

                                    wireframe: false,

                                    nodes: [
                                        {
                                            type: "material",
                                            baseColor:          { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:           0.9,
                                            shine:              6.0,

                                            nodes: [
                                                {
                                                    type: "translate",
                                                    x   : 0,
                                                    y   : -7,
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
                         * Teapot 7
                         */
                        {
                            type: "node",
                            id : "teapot7",
                            nodes : [
                                {
                                    type: "renderer",
                                    id: "teapot7-renderer",

                                    // We'll toggle this on pick

                                    frontFace: false,

                                    nodes: [
                                        {
                                            type: "material",
                                            baseColor:          { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:           0.9,
                                            shine:              6.0,

                                            nodes: [
                                                {
                                                    type: "translate",
                                                    x   : -7,
                                                    y   : -7,
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
                         * Teapot 8
                         */
                        {
                            type: "renderer",
                            id : "teapot8",
                            nodes : [

                                {
                                    type: "translate",
                                    x   : -14,
                                    y   : -7,
                                    nodes: [
                                        {
                                            type: "material",
                                            id: "teapot8-material",

                                            baseColor:          { r: 0.6, g: 0.3, b: 0.9 },
                                            specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:           0.9,
                                            shine:              6.0,

                                            nodes: [
                                                {
                                                    type: "renderer",
                                                    id: "teapot8-renderer",

                                                    nodes: [
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "material",
                                            baseColor:          { r: 0.4, g: 0.4, b: 0.4 },
                                            specularColor:      { r: 0.7, g: 0.7, b: 0.7 },
                                            specular:           0.9,
                                            shine:              6.0,

                                            nodes: [
                                                {
                                                    type: "translate",
                                                    z   : 2,
                                                    x :-1,
                                                    y: 2,
                                                    nodes: [
                                                        {
                                                            type: "scale",
                                                            x: 1.0,
                                                            y: 3,
                                                            z: 1.0,
                                                            nodes: [
                                                                {
                                                                    type: "cube"
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


/*-------------------------------------------------------------------------
 * Define our custom commands
 *------------------------------------------------------------------------*/

var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

/* Command to set a target material node's baseColor attribute to red
 */
commandService.addCommand("set-material-red", {
    execute: function(params) {
        var node = SceneJS.withNode(params.target);
        if (node.get("type") == "material") {
            node.set("baseColor", { r: 1, g: 0, b: 1});
        }
    }
});

/* Command to increment a target rotate node's angle attribute
 */
commandService.addCommand("inc-rotate", {
    execute: function(params) {
        var node = SceneJS.withNode(params.target);
        if (node.get("type") == "rotate") {
            node.set("angle", node.get("angle") + 1.0);
        }
    }
});

/*-------------------------------------------------------------------------
 * Now schedule the commands
 *------------------------------------------------------------------------*/

/* Whenever SceneJS initilizes, set "teapot1"'s color to red
 */
SceneJS.Message.sendMessage({

    command: "bind",
    bindId: "teapot1-red-on-init",
    triggers: {
        "init": {
            once: false
        }
    },
    message: {
        command: "set-material-red",
        target: "teapot1-material"
    },

    messages:[

        /* Whenever our scene is about to render, rotate teapot1 by one degree
         */
        {
            command: "bind",
            bindId: "teapot1-rotate-on-rendering",
            triggers: {
                "scene-rendering": {
                    once: false
                }
            },
            message: {
                command: "inc-rotate",
                target: "teapot1-rotate"
            }
        }
    ]
});

SceneJS.withNode("my-scene").start();

