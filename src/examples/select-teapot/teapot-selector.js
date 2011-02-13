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

                                //----------------------------------------------------------------------------------
                                // Our Selector node selects three of its four sub-graphs to display three Teapots.
                                // Try changing the indices in its "selection" property to change its selection.
                                //----------------------------------------------------------------------------------

                                {
                                    type: "selector",
                                    selection: [0, 1, 3],

                                    nodes: [
                                        {
                                            type:"translate",
                                            y : 15,
                                            nodes: [
                                                {
                                                    type: "text",
                                                    size: 80,
                                                    text: "     Selector selection contains 0",
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
                                            nodes: [
                                                {
                                                    type: "text",
                                                    size: 80,
                                                    text: "     Selector selection contains 1",
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
                                            nodes: [
                                                {
                                                    type: "text",
                                                    size: 80,
                                                    text: "     Selector selection contains 2",
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
                                            nodes: [
                                                {
                                                    type: "text",
                                                    size: 80,
                                                    text: "     Selector selection contains 3",
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


/*----------------------------------------------------------------------
 * Enable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : true
    }
});


/* Throw the switch, Igor!

 */
SceneJS.withNode("theScene").start();
