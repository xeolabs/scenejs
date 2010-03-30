/**
 * Parameterised SceneJS V0.7.0 JavaScript asset example - a spiral staircase for which
 * you can configure:
 *
 *  stepTexture - "marble" | "redrock"
 *  stepWidth
 *  stepHeight
 *  stepDepth
 *  stepSpacing
 *  innerRadius
 *  numSteps
 *  stepAngle
 *
 * Note that, since this asset contains textured elements, it includes a renderer node
 * to ensure that texturing is enabled and a texture node to ensure that a texturing
 * shader is loaded and active.
 *
 * Also note that there are a lot of data reads going on in here that could be made
 * a great deal more efficient by memoising their results in  some sort of closure.
 *
 */
SceneJS.renderer({ enableTexture2D: true },

        SceneJS.texture(
                function(data) {
                    var texFile;
                    var stepTexture = data.get("stepTexture");
                    if (stepTexture) {
                        switch (stepTexture) {

                            case "redstone":
                                texFile = "stone/red-stone.jpg";
                                break;

                            case "marble":
                                texFile = "marble/white-marble.jpg";
                                break;

                            default:
                                throw new SceneJS.exceptions.InvalidNodeConfigException
                                        ("Unsupported value for staircase asset 'stepTexture' parameter: '" + data.get("stepTexture") + "'");
                        }
                        return {
                            layers : [
                                {
                                    uri:"http://scenejs.org/library/textures/" + texFile,
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
                                                        SceneJS.objects.cube()
                                                        )
                                                )
                                        )
                                )
                        )
                )
        )

