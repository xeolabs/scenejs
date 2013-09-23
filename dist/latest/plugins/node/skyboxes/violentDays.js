/**
 * Skybox node type, with firey apocalyptic clouds
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/violentDays"
 *  });
 */
SceneJS.Types.addType("skyboxes/violentDays", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the violentDays texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/violentDays.jpg"
        })
    }
});
