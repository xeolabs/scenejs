/**
 * Skybox node type, with an interstellar cloudy background
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/interstellarClouds"
 *  });
 */
SceneJS.Types.addType("skyboxes/interstellarClouds", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the interstellarClouds texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/interstellarClouds.jpg"
        })
    }
});
