var wireGrid = {
    id: "grid-floor",
    type: "material",
    baseColor: { r: 0.3, g: 0.3, b: 0.3 },
    emit: 1,
    nodes: [
        {
            type: "scale",
            x: 1000,
            y: .5,
            z: 1000,
            nodes: [
                {
                    type: "rotate",
                    x: 1,
                    angle: 90,
                    nodes: [
                        {
                            type: "translate",
                            z: 0.0,
                            nodes: [
                                {
                                    type: "geometry",
                                    source: {
                                        //type:"box"
                                        type: "plane",
                                        wire: true,
                                        widthSegments: 200,
                                        heightSegments: 200
                                    }
                                }
                            ]
                        },
                        {
                            type: "translate",
                            z: 1.0,
                            nodes: [
                                {
                                    type: "material",
                                    baseColor: { r: 0.1, g: 0.1, b: 0.3 },
                                    specular: 1.0,
                                    nodes: [

                                        // Specular map
                                        {
                                            type: "texture",
                                            layers: [
                                                {
                                                    src: "../../textures/reflectionSpecularMap1.jpg",
                                                    applyTo: "specular" // Apply to material's "specular" property
                                                }
                                            ],
                                            nodes: [
                                                {
                                                    type: "geometry",
                                                    source: {
                                                        type: "plane",
                                                        widthSegments: 1,
                                                        heightSegments: 1
                                                    }
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
};