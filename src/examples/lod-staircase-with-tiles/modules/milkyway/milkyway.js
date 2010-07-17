/**
 * Content module containing a starry sky background sphere with configurable radius and rate of rotation
 *
 * Lindsay Kay July 15, 2010
 * lindsay.kay@xeolabs.com
 *
 * Use it in your scene like this, inside projection and view transform nodes,
 * and ordinarily not within a light node.
 *
 *  SceneJS.useModule({
 *      name: "org.scenejs.modules.sky.milkyway",
 *      params: {
 *          radius : 500.0,       // default 500.0
 *          rotationSpeed : 1.0   // default 1.0
 *      }
 * })
 *
 */
(function() {
    var configs = {};

    SceneJS.installModule("milkyway", {

        init : function (cfg) {
            configs = cfg;
        },

        getNode : function(params) {
            return SceneJS.stationary(
                    SceneJS.fog({mode:"disabled"},
                            SceneJS.scale({
                                x: params.radius || 500.0,
                                y: params.radius || 500.0,
                                z: params.radius || 500.0
                            },
                                    SceneJS.texture({
                                        layers: [
                                            {
                                                uri: configs.baseURL + "gigapixel-milky-way.gif",

                                                wrapS: "clampToEdge",
                                                wrapT: "clampToEdge",
                                                applyTo:"baseColor"
                                            }
                                        ]},
                                            SceneJS.material({
                                                baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                specular:       0.0,
                                                shine:          0.0
                                            },
                                                    SceneJS.rotate({ z: 1, angle: 45.0 },
                                                            SceneJS.rotate((function() {
                                                                var timeStarted = new Date().getTime();
                                                                var angle = 0;
                                                                return function() {
                                                                    var timeElapsed = new Date().getTime() - timeStarted;
                                                                    angle = (timeElapsed * 0.01 * (params.rotationSpeed || 1.0));
                                                                    if (angle > 360.0) {
                                                                        angle = 0;
                                                                    }
                                                                    return {
                                                                        angle:angle,
                                                                        y: 1
                                                                    };
                                                                };
                                                            })(),
                                                                    SceneJS.objects.sphere())))))));
        }
    });
})();