var scene = SceneJS.createScene({
    nodes:[
        {
            type:"camera/orbit",
            yaw:40,
            pitch:-20,
            zoom:10,
            zoomSensitivity:10.0,
            eye:{ x:0, y:0, z:10 },
            look:{ x:0, y:0, z:0 },

            nodes:[
                {
                    type:"material",
                    color:{ r:0.6, g:0.6, b:0.9 },
                    nodes:[
                        {
                            type:"geometry",
                            source:{
                                type:"box"
                            }
                        }
                    ]
                }
            ]
        }
    ]
});
