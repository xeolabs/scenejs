/**
 * Reflection map of a grid patterned box
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "reflect/grid",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("reflect/grid", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/grid.jpg";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
