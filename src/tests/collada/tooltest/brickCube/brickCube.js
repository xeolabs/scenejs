/* @module teapot
 *
 * An example of a SceneJS Module
 *
 *
 */

(function() {

    var configs = {};

    SceneJS._modules["brickCube"] = {

        configure : function (cfg) {
            configs = cfg;
        },

        node : function(options) {
            return SceneJS.material({
                baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                specular:       0.9,
                shine:          6.0
            },
                    SceneJS.texture({
                        layers: [
                            {
                                uri: configs.baseURL + "BrickWall.jpg",
                                minFilter: "linear",
                                magFilter: "linear",
                                wrapS: "clampToEdge",
                                wrapT: "clampToEdge",
                                isDepth: false,
                                depthMode:"luminance",
                                depthCompareMode: "compareRToTexture",
                                depthCompareFunc: "lequal",
                                flipY: false,
                                width: 1,
                                height: 1,
                                internalFormat:"lequal",
                                sourceFormat:"alpha",
                                sourceType: "unsignedByte",
                                applyTo:"baseColor"
                            }
                        ]}),
                    
                    SceneJS.objects.cube());
        }
    };
})();