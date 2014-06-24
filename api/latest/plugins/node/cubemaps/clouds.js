/**
 * Customizable skybox node type, which allows you to customize its texture
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/custom",
 *      texture: "foo/bar/mySkyboxTexture.jpg",
 *      size: 5000 // Box half-size on each axis - default is 5000
 *  });
 */
SceneJS.Types.addType("cubemaps/clouds", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/cubemaps/textures/clouds/";

        this.addNode({
            type: "cubemap",
            src: [
                path + "a.png",
                path + "b.png",
                path + "top.png",
                path + "bottom.png",
                path + "c.png",
                path + "d.png"
            ],
            blendFactor: params.blendFactor,
            intensity

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
