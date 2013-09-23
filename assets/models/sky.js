var skyBoxJSON = {
    type:"shader",
    shaders:[
        {
            stage:"vertex",
            code:[
                "mat4 myViewMatrix(mat4 m) {",
                "   m[3][0] =m[3][1] = m[3][2] = 0.0;" +
                    "   return m; ",
                "}"
            ],
            hooks:{
                viewMatrix:"myViewMatrix"  // Bind our custom function to hook
            }
        }
    ],

    nodes:[
        {
            type:"scale",
            x:1000,
            y:1000,
            z:1000,
            nodes:[
                {
                    type:"material",
                    baseColor:{ r:1, g:1, b:1 },
                    emit:0,
                    nodes:[
                        {
                            type:"texture",
                            layers:[
                                {
                                    "src":"../../textures/clouds-box.jpg",
                                    "blendMode":"multiply"
                                }
                            ],
                            nodes:[
                                {
                                    type:"geometry",
                                    source:{
                                        type:"skybox"
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