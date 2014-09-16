/**
 * Reflection map of a grid patterned box
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "reflect/numberedGrid",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("reflect/numberedGrid", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/numberedGrid.jpg";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
