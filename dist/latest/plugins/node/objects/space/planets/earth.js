SceneJS.Types.addType("objects/space/planets/earth", {

    construct:function (params) {

        var texturePath = SceneJS.getConfigs("pluginPath") + "/node/objects/space/planets/earth/";

        var node = this.addNode({
            type:"rotate",
            z:1,
            angle:195
        });

        var earthRotate = node = node.addNode({
            type:"rotate",
            y:1
        });

        // Layer 0: Earth's surface with color, specular
        // and emissive maps

        node = node.addNode({
            type:"layer",
            priority:0,

            nodes:[
                {
                    type:"scale",
                    x:2,
                    y:2,
                    z:2,

                    nodes:[
                        {
                            type:"material",
                            emit:1,
                            color:{ r:1.0, g:1.0, b:1.0 },
                            specularColor:{ r:0.5, g:0.5, b:0.5 },
                            specular:5.0,
                            shine:70.0,

                            nodes:[
                                {
                                    type:"texture",
                                    layers:[
//                                                                                // Bump map
//                                                                                {
//                                                                                    src:"../../../textures/earthbump.jpg",
//                                                                                    applyTo:"normals"
//                                                                                },
                                        {
                                            src:texturePath + "earth.jpg",
                                            applyTo:"color"
                                        },
                                        {
                                            src:texturePath + "earth-specular.jpg",
                                            applyTo:"specular"
                                        } ,
                                        {
                                            src:texturePath + "earth-lights.gif",
                                            applyTo:"emit"
                                        }
                                    ],
                                    nodes:[
                                        {
                                            type:"geometry",
                                            source:{
                                                type:"sphere",
                                                latitudeBands:120,
                                                longitudeBands:120
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Layer 1: Cloud layer with alpha map
        var cloudsRotate = node = node.addNode({
            type:"rotate",
            y:1,
            nodes:[
                {
                    type:"layer",
                    priority:1,
                    nodes:[
                        {
                            type:"flags",
                            flags:{
                                transparent:true,
                                specular:true
                            },
                            nodes:[
                                {
                                    type:"material",
                                    emit:0.1,
                                    alpha:0.7,
                                    color:{ r:1, g:1, b:1 },
                                    specularColor:{ r:1.0, g:1.0, b:1.0 },
                                    specular:0.5,
                                    shine:1.0,
                                    nodes:[
                                        {
                                            type:"scale",
                                            x:2.05,
                                            y:2.05,
                                            z:2.05,
                                            nodes:[
                                                {
                                                    type:"texture",
                                                    layers:[
                                                        {
                                                            src:texturePath + "earthclouds.jpg",
                                                            applyTo:"alpha",
                                                            flipY:false
                                                        }
                                                    ],
                                                    // Sphere with some material
                                                    nodes:[
                                                        {
                                                            type:"node",
                                                            z:1,
                                                            angle:195,
                                                            nodes:[
                                                                {
                                                                    type:"geometry",
                                                                    source:{
                                                                        type:"sphere",
                                                                        latitudeBands:120,
                                                                        longitudeBands:120
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
                }
            ]
        });

        var earthAngle = 0;
        var cloudsAngle = 0;

        this._tick = this.getScene().on("tick",
            function () {
                earthRotate.setAngle(earthAngle);
                cloudsRotate.setAngle(cloudsAngle);

                earthAngle -= 0.02;
                cloudsAngle -= 0.01;
            });
    },

    // Node destructor, unsubscribes from scene tick
    destruct:function () {
        this.getScene().off(this._tick);
    }
});
