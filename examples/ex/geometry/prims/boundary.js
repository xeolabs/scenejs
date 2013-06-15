var scene = SceneJS.createScene({
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
});

new SceneJS.OrbitControls(scene, {
    yaw:30,
    pitch:-30,
    zoom:5
});

