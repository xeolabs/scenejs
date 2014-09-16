/**
 * Reflection map of a holodeck
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox2/holodeck",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("skybox/gameGrid", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/gameGrid.jpg";

        this.addNode({
            type: "skybox",
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
