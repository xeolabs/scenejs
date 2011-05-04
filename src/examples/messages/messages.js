/*
 Testing subgraph creation with a WithConfigs node

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com
 */
SceneJS.createNode({
    id: "my-scene",
    type: "scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 35 },
            look : { y:1.0 },
            up : { y: 1.0 },

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
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },
                        {
                            type:"material",
                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                            specular:       0.2,
                            shine:          6.0,

                            nodes: [

                                {
                                    type: "translate",
                                    x: -1,
                                    y: 0,
                                    z: -1,

                                    nodes: [
                                        {
                                            type: "translate",
                                            x: 1,
                                            y: 0,
                                            z: 1,

                                            nodes: [
                                                {
                                                    type: "node",
                                                    id: "my-mount-node"
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


SceneJS.bind("error", function(e) {
    alert(e.exception.message);
});

// ------------ [ 1 ] ------------------------

alert("Add new subgraph..");

/* Create orphan subgraph - a Teapot wrapped in a Rotate
 */
SceneJS.Message.sendMessage({
    command: "create",
    nodes: [
        {
            type: "node",
            id: "my-subgraph",
            nodes: [
                {
                    type: "rotate",
                    id: "my-rotate",
                    angle: 0,
                    y : 1.0,
                    nodes: [
                        {
                            type: "teapot"
                        }
                    ]
                }
            ]
        }
    ]
});

SceneJS.Message.sendMessage({
    command: "update",
    target: "my-mount-node",
    add: {
        node: "my-subgraph"
    }
});

SceneJS.withNode("my-scene").render();

// ------------ [ 2 ] ------------------------

alert("Update Rotate..");

SceneJS.Message.sendMessage({
    command: "update",
    target: "my-rotate",
    set: {
        angle: 45
    }
});

SceneJS.withNode("my-scene").render();

// ------------ [ 3 ] ------------------------

alert("Add another subgraph..");

SceneJS.Message.sendMessage({
    command: "update",
    target: "my-mount-node",
    add: {
        node: {
            type:"node",
            id: "my-subgraph2",
            nodes: [
                {
                    type: "translate",
                    id: "my-translate",
                    x: 10,
                    nodes: [
                        {
                            type: "teapot"
                        }
                    ]
                }
            ]
        }
    }
});

SceneJS.withNode("my-scene").render();



// ------------ [ 4 ] ------------------------

alert("Remove first subgraph..");

SceneJS.Message.sendMessage({
    command: "update",
    target: "my-mount-node",
    remove: {
        node: "my-subgraph2"
    }
});

SceneJS.withNode("my-scene").render();

