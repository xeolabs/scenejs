/**
 * Reflection map of a holodeck
 *
 * @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox2/holodeck",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("skybox/grid", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/grid.jpg";

        this.addNode({
            type: "skybox",
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
