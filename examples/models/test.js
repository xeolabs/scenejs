var test = {

    type:"object",
    id:"grid-floor",

    nodes:[
        {
            type:"material",
            baseColor:{ r:1.0, g:1.0, b:1.0 },
            nodes:[
                {
                    type:"texture",
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
                            x:6400,
                            y:.5,
                            z:4800,
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
        }
    ]
};


scene.set("grid-floor", {
    scale:{
        x:0.5
    },
    material:{
        baseColor:{
            r:1
        }
    }
});

var test2 = {
    type:"material",
    asset:"grid-floor",
    nodes:[
        {
            type:"texture",
            asset:"grid-floor",
            nodes:[
                {
                    type:"scale",
                    x:6400,
                    y:.5,
                    z:4800,
                    nodes:[
                        {
                            type:"node",
                            asset:"armchair"
                        }
                    ]
                }
            ]
        }
    ]
};

