/**
 * A starry sky sphere
 *
 * Lindsay Kay March 26, 2010
 * lindsay.kay@xeolabs.com
 *
 * Use it in your scene like this, inside projection and view transform nodes,
 * and ordinarily not within a light node.
 *
 * withData({
 *          starrySkyRadius: 500,    // Default is 500
 *          starrySkyRotateY: 45,    // Default is 0
 *          starrySkyRotateZ: 25,    // Default is 0
 *      },
 *    load({
 *         uri:<location of this file>
 *       }
 *  )
 *
 * The texture image is from http://www.gigagalaxyzoom.org/
 */
SceneJS.stationary(
        SceneJS.fog({mode:"disabled"},
                SceneJS.scale(function(data) {
                    var radius = data.get("starrySkyRadius") || 500.0;
                    return {
                        x: radius,
                        y: radius,
                        z: radius
                    };
                },
                        SceneJS.texture({
                            layers: [
                                {
                                   uri:"http://scenejs.org/library/textures/stars/gigapixel-milky-way.gif",
					//uri:"http://scenejs.org/library/textures/sky/sky_1.jpg",
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
                                                    return function(data) {
                                                        var timeElapsed = new Date().getTime() - timeStarted;
                                                        angle = (timeElapsed * 0.001);
                                                        if (angle > 360.0) {
                                                            angle = 0;
                                                        }
                                                        return {
                                                            angle:angle,
                                                            y: 1
                                                        };
                                                    };
                                                })(),

                                                        SceneJS.objects.sphere())))))))