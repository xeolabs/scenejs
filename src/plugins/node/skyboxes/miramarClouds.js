/**
 * Skybox node type, with a cloudy Miramar beachscape background
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/miramarClouds"
 *  });
 */
SceneJS.Types.addType("skyboxes/miramarClouds", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the miramarClouds texture
        this.addNode({
            type:"skyboxes/custom",
            src:SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/miramarClouds.jpg"
        })
    }
});
