/**
 * Skybox node type, with gloomy night clouds
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/grimmNight"
 *  });
 */
SceneJS.Types.addType("skybox/grimmNight", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in a the grimmNight texture
        this.addNode({
            type:"skybox",
            src:SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/grimmNight.jpg"
        })
    }
});
