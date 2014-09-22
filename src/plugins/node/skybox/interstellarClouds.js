/**
 * Skybox node type, with an interstellar cloudy background
 *
 * @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/interstellarClouds"
 *  });
 */
SceneJS.Types.addType("skybox/interstellarClouds", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the interstellarClouds texture
        this.addNode({
            type:"skybox",
            src:SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/interstellarClouds.jpg"
        })
    }
});
