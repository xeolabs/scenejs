/**
 * Reflection map of blue sky and white clouds
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "reflect/clouds",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("reflect/clouds", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/clouds/";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [
                path + "a.png",
                path + "b.png",
                path + "top.png",
                path + "bottom.png",
                path + "c.png",
                path + "d.png"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
