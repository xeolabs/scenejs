/**
 * Reflection map of a holodeck
 *
 * @author xeolabs / http://xeolabs.com
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skybox2/holodeck",
 *      intensity: 0.2
 *  });
 */
SceneJS.Types.addType("skybox/holodeck", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/skybox/textures/holodeck/";

        this.addNode({
            type: "skybox",
            src: [
                path + "east.jpg",
                path + "west.jpg",
                path + "top.jpg",
                path + "bottom.jpg",
                path + "north.jpg",
                path + "south.jpg"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
