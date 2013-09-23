/**
 * Skybox node type, with stormy clouds
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/stormyDays"
 *  });
 */
SceneJS.Types.addType("skyboxes/stormyDays", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the stormyDays texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/stormyDays.jpg"
        })
    }
});
