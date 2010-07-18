/**----------------------------------------------------------------------------------------------------------
 * Content module defining a SceneJS 0.7.6 subgraph defining a spiral staircase. This module
 * takes parameters on a data context (created by a SceneJS.WithData, or injected into setData on the scene
 * root) such as:
 *
 * stepTexture    - "redstone" or "marble"
 * stepAngle      - rotation angle increment per step
 * stepSpacing    - space between each step
 * numSteps       - total number of steps
 * innerRadius    - radius from centre column to inside of each step
 * stepWidth      - width of each step
 * stepHeight     - thickness of each step
 * stepDepth      - depth of each step, from front to back
 *
 * You would normally specify such parameters to the module's getNode method, but 
 * this allows higher nodes to play a part in generating them.
 *  
 * Usage example:
 * 
 *   SceneJS.withData({
 *          stepTexture: "marble" or "redstone" - selects between a two texure files bundled with module
 *          stepWidth:7,
 *          stepHeight:0.6,
 *          stepDepth:3,
 *          stepSpacing:1.5,
 *          innerRadius:10,
 *          numSteps:48,
 *          stepAngle:20 
 *       },
 *          SceneJS.useModule({
 *                  name: "spiral-staircase"
 *              })
 *   );
 *----------------------------------------------------------------------------------------------------------*/
(function() {

    var configs = {};

    SceneJS.installModule("staircase", {

        init : function (cfg) {
            configs = cfg;
        },

        getNode : function(params) {
            return  SceneJS.texture(
                    function(data) {
                        var texFile;
                        var stepTexture = data.get("stepTexture");
                        if (stepTexture) {
                            switch (stepTexture) {

                                case "redstone":
                                    texFile = "red-stone.jpg";
                                    break;

                                case "marble":
                                    texFile = "white-marble.jpg";
                                    break;

                                default:
                                    throw new SceneJS.errors.InvalidNodeConfigException
                                            ("Unsupported value for staircase asset 'stepTexture' parameter: '" + data.get("stepTexture") + "'");
                            }
                            return {
                                layers : [
                                    {
                                        uri: configs.baseURL + texFile,
                                        applyTo:"baseColor",
                                        minFilter: "nearestMipMapLinear",
                                        maxFilter: "linearMapLinear"

                                    }
                                ]
                            };
                        } else {
                            return {
                                layers: [] // No texture
                            };
                        }
                    },

                    SceneJS.material({
                        baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                        specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                        specular:       0.9,
                        shine:          6.0
                    },
                            SceneJS.generator((function() {
                                var angle = 0;
                                var height = -10;
                                var stepNum = 0;
                                return function(data) {

                                    angle += data.get("stepAngle") || 25.0;
                                    height += data.get("stepSpacing") || 2.0;

                                    var numSteps = data.get("numSteps") || 10;
                                    if (stepNum < numSteps) {
                                        stepNum++;
                                        return { angle: angle, height: height };
                                    } else {
                                        stepNum = 0;
                                        angle = 0;
                                        height = -10;
                                    }
                                };
                            })(),
                                    SceneJS.rotate(
                                            function(data) {
                                                return { angle : data.get("angle"), y: 1.0 };
                                            },
                                            SceneJS.translate(
                                                    function(data) {
                                                        return { x: data.get("innerRadius") || 10.0, y : data.get("height") };
                                                    },
                                                    SceneJS.scale(
                                                            function(data) {
                                                                return {
                                                                    x: data.get("stepWidth") || 5.0,
                                                                    y: data.get("stepHeight") || 0.5,
                                                                    z: data.get("stepDepth") || 3.0
                                                                };
                                                            },
                                                            SceneJS.objects.cube())
                                                    )
                                            )
                                    )
                            )
                    );

        }
    });
})();
