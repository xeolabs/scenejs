SceneJS.Types.addType("sky/clouds", {

    init:function (params) {

        // Vertex shader which anchors the skybox translation
        this.addNode({
            type:"shader",
            shaders:[
                {
                    stage:"vertex",
                    code:[
                        "mat4 myViewMatrix(mat4 m) {",
                        "   m[3][0] =m[3][1] = m[3][2] = 0.0;",
                        "return m;",
                        "}"
                    ],
                    // Bind our injected functions to SceneJS hook points
                    hooks:{
                        viewMatrix:"myViewMatrix"
                    }
                }
            ],
            nodes:[
                // Disable lighting for the sky box
                {
                    type:"flags",
                    flags:{
                        specular:false,
                        diffuse:false,
                        ambient:false
                    },
                    nodes:[
                        {
                            type:"material",
                            color:{ r:0, g:0, b:0  },
                            emit:0.0,
                            nodes:[
                                // Clouds texture
                                {
                                    type:"texture",
                                    layers:[
                                        {
                                            src:"file:///home/lindsay/xeolabs/projects/scenejs3.0/api/latest/plugins/node/sky/clouds/clouds.jpg",
                                            blendMode:"add"
                                        }
                                    ],
                                    nodes:[
                                        {
                                            type:"scale",
                                            x:2000, y:2000, z:2000,
                                            nodes:[
                                                // Sky box geometry
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
                }
            ]
        })
    }
});
