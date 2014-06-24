/**
 * Reflection map of a street in London
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "reflections/london",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("reflections/london", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflections/textures/london/";

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
