/**
 * Reflection map of a numbered grid
 *
 * @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/numberedGrid",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("skybox/numberedGrid", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/numberedGrid.jpg";

        this.addNode({
            type: "skybox",
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
