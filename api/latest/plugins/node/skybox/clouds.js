/**
 * Cloudy skybox node type, with fine clouds
 *
 *  @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/clouds"
 *  });
 */
SceneJS.Types.addType("skybox/clouds", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in a clouds texture
        this.addNode({
            type:"skybox",
            src:SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/clouds.jpg"
        })
    }
});
