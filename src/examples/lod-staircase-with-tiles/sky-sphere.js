SceneJS.createNode({

    // Prevent sky sphere from moving as lookat.eye moves
    type: "stationary",
    id: "sky-sphere",

    nodes: [

        // Define fog just to disable it for our sky sphere
        {
            type: "fog",
            mode:"disabled",
            flags: { backfaces: true },
            nodes: [

                // Size of sky sphere
                {
                    type: "scale",
                    x: 500.0,
                    y: 500.0,
                    z: 500.0,
                    nodes: [

                        // Starry texture
                        {
                            type: "texture",
                            layers: [
                                {
                                    uri: "images/gigapixel-milky-way.gif",
                                    minFilter: "linearMipMapLinear",
                                    magFilter: "linear",
                                    wrapS: "repeat",
                                    wrapT: "repeat",
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
                                    applyTo:"emit",
                                    blendMode:"multiply",
                                    scale: { x: 3, y: 3 }
                                }
                            ],
                            nodes: [

                                // Material for texture to apply to
                                {
                                    type: "material",
                                    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                    specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                    specular:       0.0,
                                    shine:          0.0,
                                    emit: 1.0,
                                    nodes: [

                                        // Tilt the milky way a little bit
                                        {
                                            type: "rotate",
                                            z: 1,
                                            angle: 45.0,
                                            nodes: [

                                                // Milky way spin
                                                {
                                                    type: "rotate",
                                                    id: "milkyway-spin",
                                                    y: 1,
                                                    angle: 0.0,
                                                    nodes: [
                                                        // Sphere geometry
                                                        {
                                                            type: "sphere"
                                                        }

                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },

        // Interpolates the milky way spin - this node could be anywhere in the scene
        {
            type: "interpolator",
            target: "milkyway-spin",
            targetProperty: "angle",
            keys: [0.0, 1000],
            // Seconds
            values: [0.0, 2000]        // Values (spin degrees)

        }
    ]
});
