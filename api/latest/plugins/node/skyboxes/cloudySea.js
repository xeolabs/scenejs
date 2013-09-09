/**
 * Cloudy skybox node type, with clouds reflected in a calm sea
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/cloudySea"
 *  });
 */
SceneJS.Types.addType("skyboxes/cloudySea", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in a cloudySea texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/cloudySea.jpg"
        })
    }
});
