/**
 * Drinking Bird Toy
 *
 * @author Moritz Kornher
 *
 *  Usage example:
 *
 * someNode.addNode({
 *      type: "models/toys/drinkingBird",
 *      rotate: true // Default false - causes bird to drink when true
 *  });
 *
 */
SceneJS.Types.addType("models/toys/drinkingBird", {

    init:function (params) {

        this.rotate = params.rotate || false;

        this.angle = 18;
        this.direction = -1;
        this.speed = 1.7;

        // set up library
        // TODO: if not existing
        this._library = this.addNode({
            type:"library",
            nodes:[
                // feet material
                {
                    type:"material",
                    color:{ r:1.0, g:0.0, b:0.0 },
                    coreId:"feetMaterial"
                },
                // leg material
                {
                    type:"material",
                    color:{ r:0.86, g:0.86, b:0.86 },
                    coreId:"legMaterial"
                },
                // head material
                {
                    type:"material",
                    color:{ r:1.0, g:0.0, b:0.0 },
                    coreId:"headMaterial"
                },
                // hat material
                {
                    type:"material",
                    color:{ r:0.0, g:0.0, b:0.0 },
                    specularColor:{ r:1.0, g:1.0, b:1.0 },
                    specular:1.0,
                    shine:50.0,
                    coreId:"hatMaterial"
                },

                // glass material
                {
                    type:"material",
                    color:{ r:0.3, g:0.3, b:0.3 },
                    specularColor:{ r:1.0, g:1.0, b:1.0 },
                    specular:1.0,
                    shine:80.0,
                    alpha:0.3,
                    coreId:"glassMaterial"
                },
                //~ envMap: skyRefraction,
                //~ refractionRatio: 0.3, reflectivity: 0.8

                // water material
                {
                    type:"material",
                    color:{ r:0.0, g:0.0, b:1.0 },
                    specularColor:{ r:0.0, g:0.0, b:1.0 },
                    specular:1.0,
                    shine:30.0,
                    alpha:0.7,
                    coreId:"waterMaterial"
                }
                //~ envMap: skyRefraction,
                //~ refractionRatio: 0.3, reflectivity: 0.4

            ]
        });

        // bird and root node
        this._bird = this.addNode({
            type:"translate",
            x:0, y:0, z:0
        });
        this._bird = this._bird.addNode({
            type:"rotate",
            x:1, y:0, z:0,
            angle:0
        });


        // crossbar
        this._bird.addNode({
            type:"translate",
            x:0, y:360, z:0,
            nodes:[
                {
                    type:"rotate",
                    x:0, y:0, z:1,
                    angle:90,
                    nodes:[
                        {
                            type:"material",
                            color:{ r:0.53, g:0.53, b:0.53 },
                            nodes:[
                                {
                                    type:"geometry/cylinder",
                                    radiusTop:5,
                                    radiusBottom:5,
                                    height:300,
                                    radialSegments:32
                                }
                            ]
                        }
                    ]
                }
            ]
        });


        // mount and feet
        var mount = this._bird.addNode({
            type:"node",
            nodes:[
                {
                    type:"translate",
                    x:0, y:2, z:-45,
                    nodes:[
                        {
                            type:"material",
                            coreId:"feetMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:83,
                                    ySize:2,
                                    zSize:(110 + 64 + 20) / 2
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        var leftFeet = mount.addNode({
            type:"translate",
            x:-80, y:0, z:0,
            nodes:[
                {
                    type:"translate",
                    x:0, y:30, z:-45,
                    nodes:[
                        {
                            type:"material",
                            coreId:"feetMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:3,
                                    ySize:52 / 2,
                                    zSize:(110 + 64 + 20) / 2
                                }
                            ]
                        }
                    ]
                },
                {
                    type:"translate",
                    x:0, y:71, z:0,
                    nodes:[
                        {
                            type:"material",
                            coreId:"feetMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:3,
                                    ySize:15,
                                    zSize:64 / 2
                                }
                            ]
                        }
                    ]
                },
                {
                    type:"translate",
                    x:0, y:15 + 56 + 334 / 2, z:0,
                    nodes:[
                        {
                            type:"material",
                            coreId:"legMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:3,
                                    ySize:(334 - 30) / 2,
                                    zSize:64 / 2
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        var rightFeet = mount.addNode({
            type:"translate",
            x:80, y:0, z:0,
            nodes:[
                {
                    type:"translate",
                    x:0, y:30, z:-45,
                    nodes:[
                        {
                            type:"material",
                            coreId:"feetMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:3,
                                    ySize:52 / 2,
                                    zSize:(110 + 64 + 20) / 2
                                }
                            ]
                        }
                    ]
                },
                {
                    type:"translate",
                    x:0, y:71, z:0,
                    nodes:[
                        {
                            type:"material",
                            coreId:"feetMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:3,
                                    ySize:15,
                                    zSize:64 / 2
                                }
                            ]
                        }
                    ]
                },
                {
                    type:"translate",
                    x:0, y:15 + 56 + 334 / 2, z:0,
                    nodes:[
                        {
                            type:"material",
                            coreId:"legMaterial",
                            nodes:[
                                {
                                    type:"geometry/box",
                                    xSize:3,
                                    ySize:(334 - 30) / 2,
                                    zSize:64 / 2
                                }
                            ]
                        }
                    ]
                }
            ]
        });


        // body
        var body = this._bird.addNode({
            type:"translate",
            y:360
        });
        body = this._birdBodyRotation = body.addNode({
            type:"rotate",
            x:1, y:0, z:0
        });
        body = body.addNode({
            type:"translate",
            y:-200
        });


        // lowerbody
        var lowerBody = body.addNode({
            type:"node",
            nodes:[
                {
                    type:"flags",
                    flags:{
                        transparent:true
                    },
                    nodes:[
                        {
                            type:"translate",
                            y:225 / 2,
                            nodes:[
                                {
                                    type:"material",
                                    coreId:"waterMaterial",
                                    nodes:[
                                        {
                                            type:"geometry/cylinder",
                                            radiusTop:8,
                                            radiusBottom:8,
                                            height:300,
                                            radialSegments:16
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type:"rotate",
                            x:1,
                            id:"birdWaterRotation",
                            nodes:[
                                {
                                    type:"translate",
                                    y:3,
                                    nodes:[
                                        {
                                            type:"material",
                                            coreId:"waterMaterial",
                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"sphere",
                                                        latudeBands:32,
                                                        longitudeBands:16,
                                                        radius:52,
                                                        thetaStart:Math.PI / 2,
                                                        thetaLength:Math.PI
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type:"material",
                                            coreId:"waterMaterial",
                                            nodes:[
                                                {
                                                    type:"geometry/cylinder",
                                                    radiusTop:52,
                                                    radiusBottom:52,
                                                    height:0,
                                                    radialSegments:32
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        },
                        {
                            type:"translate",
                            y:350 / 2,
                            nodes:[
                                {
                                    type:"material",
                                    coreId:"glassMaterial",
                                    nodes:[
                                        {
                                            type:"geometry/cylinder",
                                            radiusTop:12,
                                            radiusBottom:12,
                                            height:435,
                                            radialSegments:16
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type:"material",
                            coreId:"glassMaterial",
                            nodes:[
                                {
                                    type:"geometry",
                                    source:{
                                        type:"sphere",
                                        latudeBands:32,
                                        longitudeBands:32,
                                        radius:58
                                    }
                                }
                            ]
                        },
                    ]
                }
            ]
        });


        // head
        var head = body.addNode({
            type:"translate",
            y:390,
            nodes:[
                // head sphere
                {
                    type:"material",
                    coreId:"headMaterial",
                    nodes:[
                        {
                            type:"geometry",
                            source:{
                                type:"sphere",
                                latudeBands:32,
                                longitudeBands:32,
                                radius:52
                            }
                        }
                    ]
                },

                // nose
                {
                    type:"translate",
                    x:0, y:-15, z:-80,
                    nodes:[
                        {
                            type:"rotate",
                            x:1, y:0, z:0,
                            angle:-90,
                            nodes:[
                                {
                                    type:"material",
                                    coreId:"headMaterial",
                                    nodes:[
                                        {
                                            type:"geometry/cylinder",
                                            radiusTop:8,
                                            radiusBottom:15,
                                            height:70,
                                            radialSegments:16
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                // left eye
                {
                    type:"translate",
                    x:0, y:0, z:-45,
                    nodes:[
                        {
                            type:"rotate",
                            x:0, y:0, z:1,
                            angle:-50,
                            nodes:[
                                {
                                    type:"translate",
                                    x:0, y:27, z:0,
                                    nodes:[
                                        {
                                            type:"material",
                                            color:{ r:1.0, g:1.0, b:1.0 },
                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"sphere",
                                                        latudeBands:8,
                                                        longitudeBands:8,
                                                        radius:8
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type:"translate",
                                            x:0, y:0, z:-6,
                                            nodes:[
                                                {
                                                    type:"material",
                                                    color:{ r:0.0, g:0.0, b:0.0 },
                                                    nodes:[
                                                        {
                                                            type:"geometry",
                                                            source:{
                                                                type:"sphere",
                                                                latudeBands:8,
                                                                longitudeBands:8,
                                                                radius:4
                                                            }
                                                        }
                                                    ]
                                                },
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                // right eye
                {
                    type:"translate",
                    x:0, y:0, z:-45,
                    nodes:[
                        {
                            type:"rotate",
                            x:0, y:0, z:1,
                            angle:50,
                            nodes:[
                                {
                                    type:"translate",
                                    x:0, y:27, z:0,
                                    nodes:[
                                        {
                                            type:"material",
                                            color:{ r:1.0, g:1.0, b:1.0 },
                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"sphere",
                                                        latudeBands:8,
                                                        longitudeBands:8,
                                                        radius:8
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type:"translate",
                                            x:0, y:0, z:-6,
                                            nodes:[
                                                {
                                                    type:"material",
                                                    color:{ r:0.0, g:0.0, b:0.0 },
                                                    nodes:[
                                                        {
                                                            type:"geometry",
                                                            source:{
                                                                type:"sphere",
                                                                latudeBands:8,
                                                                longitudeBands:8,
                                                                radius:4
                                                            }
                                                        }
                                                    ]
                                                },
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
            ]
        });

        var hat = head.addNode({
            type:"translate",
            y:45,
            x:0.001,
            nodes:[
                {
                    type:"material",
                    coreId:"hatMaterial",
                    nodes:[
                        {
                            type:"geometry/cylinder",
                            radiusTop:71,
                            radiusBottom:71,
                            height:10,
                            radialSegments:32
                        }
                    ]
                },
                {
                    type:"translate",
                    x:0, y:38, z:0,
                    nodes:[
                        {
                            type:"material",
                            coreId:"hatMaterial",
                            nodes:[
                                {
                                    type:"geometry/cylinder",
                                    radiusTop:45,
                                    radiusBottom:45,
                                    height:66,
                                    radialSegments:32
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // register animation
        var birdWaterRotation = scene.getNode("birdWaterRotation"); // TODO: unique IDs - allow many brds
        var scope = this;
        this._tick = this.getScene().on("tick",
            function () {
                if (scope.rotate) {
                    if (0 > scope.direction && scope.angle < -100) {
                        scope.direction = 1;
                        scope.speed = 260;
                    } else if (0 < scope.direction && scope.angle > 18) {
                        scope.direction = -1;
                        scope.speed = 1.7;
                    }
                    scope.speed += -1 * scope.direction * Math.log(scope.speed);
                    scope.angle = scope.angle + scope.direction * (scope.speed / 100 + 0.5);
                    scope._birdBodyRotation.setAngle(scope.angle);
                    //~ scope._birdWaterRotation.setAngle(-scope.angle);
                    birdWaterRotation.setAngle(-scope.angle);
                }
            });
    },

    // Node destructor, unsubscribes from scene tick
    destroy:function () {
        this.getScene().off(this._tick);
    }
});
