var wireGrid = {
    id:"grid-floor",
    type:"material",
    baseColor:{ r:0.9, g:0.9, b:1.0 },
    emit:1,
    nodes:[
        {
            type:"shader",
            shaders:[
                {
                    stage:"vertex",
                    code:"vec4 myModelPosFunc(vec4 pos){\n\
                        pos.z=pos.z+sin(pos.x*0.5 + pos.y*0.5)*5.0;\n\
                        return pos;\n\
                       }\n",
                    hooks:{
                        modelPos:"myModelPosFunc"
                    }
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
                                        wire:true,
                                        widthSegments:200,
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