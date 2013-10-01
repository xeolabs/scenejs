/**
 * Cloudy skybox node type, with fine clouds
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/clouds"
 *  });
 */
SceneJS.Types.addType("skyboxes/clouds", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in a clouds texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/clouds.jpg"
        })
    }
});
