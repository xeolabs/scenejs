/**
 * Reflection map of a grid
 *
 * @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/grid2",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("skybox/grid2", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/grid2.jpg";

        this.addNode({
            type: "skybox",
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
