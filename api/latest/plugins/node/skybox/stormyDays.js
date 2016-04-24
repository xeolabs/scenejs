/**
 * Skybox node type, with stormy clouds
 *
 * @author xeographics / http://xeographics.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/stormyDays"
 *  });
 */
SceneJS.Types.addType("skybox/stormyDays", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the stormyDays texture
        this.addNode({
            type:"skybox",
            src:SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/stormyDays.jpg"
        })
    }
});
