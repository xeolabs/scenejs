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
SceneJS.Types.addType("cubemaps/london", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/cubemaps/textures/london/";

        this.addNode({
            type: "cubemap",
            src: [
                path + "pos-x.png",
                path + "neg-x.png",
                path + "pos-y.png",
                path + "neg-y.png",
                path + "pos-z.png",
                path + "neg-z.png"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
