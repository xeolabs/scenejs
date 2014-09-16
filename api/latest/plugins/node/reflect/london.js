/**
 * Reflection map of a street in London
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "reflect/london",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("reflect/london", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/london/";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [
                path + "pos-x.png",
                path + "neg-x.png",
                path + "pos-y.png",
                path + "neg-y.png",
                path + "pos-z.png",
                path + "neg-z.png"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
