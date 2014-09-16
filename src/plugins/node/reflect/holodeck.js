/**
 * Reflection map of a holodeck
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "reflect/holodeck",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("reflect/holodeck", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/holodeck/";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [
                path + "east.jpg",
                path + "west.jpg",
                path + "top.jpg",
                path + "bottom.jpg",
                path + "north.jpg",
                path + "south.jpg"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
