var gridFloor = SceneJS.createNode({
    type: "material",
    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
    specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
    specular:       0.9,
    shine:          6.0,
    nodes: [
        {
            type: "texture",
            layers: [
                {
                    uri: "images/grid.jpg",
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
                    applyTo:"baseColor",
                    scale : { x: 300, y: 300, z: 1.0 }
                }
            ],
            nodes: [
                {
                    type: "scale",
                    x: 6400,
                    y: .5,
                    z : 4800,
                    nodes: [
                        {
                            type: "cube"
                        }
                    ]
                }
            ]
        }
    ]
});