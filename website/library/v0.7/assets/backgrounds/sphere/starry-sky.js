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
 *         radius: 500
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

            /* This is a hack for http://github.com/xeolabs/scenejs/issues/issue/19
             */
                SceneJS.light({
                    lights: [
                        {
                            type:                   "point",
                            ambient:                { r: 0.0, g: 0.0, b: 0.0 },
                            diffuse:                { r: 0.0, g: 0.0, b: 0.0 },
                            specular:               { r: 0.0, g: 0.0, b: 0.0 },
                            pos:                    { x: 0.0, y: 0.0, z: 0.0 },
                            constantAttenuation:    100.0,
                            quadraticAttenuation:   0.0,
                            linearAttenuation:      0.0
                        }
                    ]},

                        SceneJS.scale(function(data) {
                            var radius = data.get("radius") || 500.0;
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
                                            wrapS: "clampToEdge",
                                            wrapT: "clampToEdge",
                                            applyTo:"emission"
                                        }
                                    ]},
                                        SceneJS.material({
                                            ambient: { r: .0, g: .0, b: .0 },
                                            emission: { r: 1.0, g: 1.0, b: 1.0 }
                                        },
                                                SceneJS.objects.sphere()
                                                ))))
                ))
