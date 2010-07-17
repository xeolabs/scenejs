/*
 * An example of a SceneJS Module
 */
(function() {

    var configs = {};

    SceneJS.installModule("brickCube", {

        init : function (cfg) {
            configs = cfg;
        },

        getNode : function(params) {

            return SceneJS.material({
                baseColor:  { r: 1.0, g: 1.0, b: 1.0 },
                shine:      6.0
            },
                    SceneJS.texture({
                        layers: [
                            {
                                uri: configs.baseURL + "BrickWall.jpg",
                                applyTo:"baseColor"
                            }
                        ]},
                            SceneJS.scale({
                                x : params.x || 1.0,
                                y : params.y || 1.0,
                                z : params.z || 1.0},

                                    SceneJS.objects.cube())));
        }
    });
})();