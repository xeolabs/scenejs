/**
 * Skybox node type, with firey apocalyptic clouds
 *
 * @author xeographics / http://xeographics.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox/violentDays"
 *  });
 */
SceneJS.Types.addType("skybox/violentDays", {
    construct:function (params) {

        // Wraps a 'custom' skybox node type, passing in the violentDays texture
        this.addNode({
            type:"skybox",
            src:SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/violentDays.jpg"
        })
    }
});
