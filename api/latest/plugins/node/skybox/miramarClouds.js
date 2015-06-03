/**
 * Skybox node type, with a cloudy Miramar beachscape background
 *
 * @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/miramarClouds"
 *  });
 */
SceneJS.Types.addType("skybox/miramarClouds", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the miramarClouds texture
        this.addNode({
            type:"skybox",
            src:SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/miramarClouds.jpg"
        })
    }
});
