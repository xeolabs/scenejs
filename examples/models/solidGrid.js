var solidGrid = {
    id:"grid-floor",
    type:"material",
    baseColor:{ r:0.9, g:0.9, b:1.0 },
    emit:1,
    nodes:[
        {
            type:"node",
            layers:[
                {
                    uri:"../../textures/grid.jpg",
                    wrapS:"repeat",
                    wrapT:"repeat",

                    scale:{ x:300, y:300, z:1.0 }
                }
            ],
            nodes:[
                {
                    type:"scale",
                    x:1000,
                    y:.5,
                    z:1000,
                    nodes:[
                        {
                            type:"rotate",
                            x:1,
                            angle:90,
                            nodes:[
                                {
                                    type:"geometry",
                                    source:{
                                        //type:"box"
                                        type:"plane",
                                        wire: false,
                                        widthSegments: 200,
                                        heightSegments:200
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};