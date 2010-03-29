SceneJS.material({
    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
    specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
    specular:       0.9,
    shine:          6.0
},
        SceneJS.texture({
            layers: [
                {
                    uri:"http://scenejs.org/library/textures/stone/Stone45l.jpg",
                    applyTo: "diffuse",
                    flipY:true,
                    minFilter: "nearestMipMapLinear"
                }
            ]},
                SceneJS.generator(
                        (function() {
                            var x = -200;
                            var z = -200;
                            return function(data) {
                                x += 40.;
                                if (x > 200.0) {
                                    x = -200.0;
                                    z += 40.0;
                                }
                                if (z < 200.0) {
                                    return { x: x,  z : z };
                                }
                                x = z = -200.0;
                                return null;
                            };
                        })(),
                        SceneJS.translate(function(data) {
                            return { x: data.get("x"), z: data.get("z") };
                        },
                                SceneJS.scale({ x: 20, y: .5, z : 20 },
                                        SceneJS.objects.cube()
                                        )
                                )
                        )))
