/**
 * Skybox node type, with gloomy night clouds
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/grimmNight"
 *  });
 */
SceneJS.Types.addType("skyboxes/grimmNight", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in a the grimmNight texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/grimmNight.jpg"
        })
    }
});
