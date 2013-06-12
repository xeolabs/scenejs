SceneJS.Types.addType("particles/bubble", {

    init:function (params) {

        var node = this.addNode({
            type:"shader",
            coreId:"bubbleShader",

            "shaders":[

                // We'll just customize the fragment shader
                {
                    "stage":"fragment",
                    "code":[

                        // Input for this shader - the degree of opacity from [0..1]
                        "uniform float  xrayOpacity;",

                        // User-injected function to intercept the World-space fragment normal
                        "vec3 myworldNormal = vec3(0.0, 0.0,  1.0);",
                        "void myWorldNormalFunc(vec3 vec) {",
                        "   myworldNormal = vec;",
                        "}",

                        // User-injected function to intercept the World-space fragment-eye vector
                        "vec3 myworldEyeVec = vec3(0.0, 0.0, -1.0);",
                        "void myWorldEyeVecFunc(vec3 vec) {",
                        "   myworldEyeVec = vec;",
                        "}",

                        // User-injected function to alter the alpha of the outgoing fragment color,
                        // in proportion to the angle between the fragment normal and the
                        // fragment-eye vector
                        "vec4 myPixelColorFunc(vec4 color) {",
                        "   color.a = (xrayOpacity + 0.9 - abs(dot(myworldNormal, myworldEyeVec)));",
                        "   return color;",
                        "}"
                    ],

                    // Bind our injected functions to SceneJS hook points
                    hooks:{
                        worldNormal:"myWorldNormalFunc",
                        worldEyeVec:"myWorldEyeVecFunc",
                        pixelColor:"myPixelColorFunc"
                    }
                }
            ],

            // Provide optional initial value for our input uniform
            params:{
                xrayOpacity:0.3
            }
        });

        // Disable backfaces (they look ugly with transparency)
        // Enable transparency (causing geometries to go into
        // the renderer's transparency bin)
        var flags = node.addNode({
            type:"flags",
            coreId:"bubbleFlags",
            flags:{
                transparent:true,
                backfaces:false
            }
        });

        // Oily texture
        node = node.addNode({
            type:"texture",
            coreId:"bubbleTexture",
            layers:[
                {
                    src:"../../textures/oilySheen.jpg",
                    applyTo:"color"
                }
            ]
        });

        // Bluish color
        node = node.addNode({
            type:"material",
            coreId:"bubbleMaterial",
            emit:0.1,
            color:{ r:0.9, g:0.8, b:1.0 },
            specularColor:{ r:1.0, g:1.0, b:1.0 },
            specular:1.0,
            shine:10.0
        });

//        node = node.addNode({
//            type:"name",
//            name:"name"
//        });

        this._translate = node = node.addNode({
            type:"translate"
        });

        this._scale = node = node.addNode({
            type:"scale",
            x:1,
            y:1,
            z:1
        });

        this._rotate = node = node.addNode({
            type:"rotate",
            x:Math.random() - 0.5,
            y:Math.random() - 0.5,
            z:Math.random() - 0.5,
            angle:0,
            nodes:[
                {
                    type:"geometry",
                          coreId:"bubble",
                    source:{
                        type:"sphere"
                    }
                }
            ]
        });

        if (params.pos) {
            this.setPos(params.pos);
        }

        if (params.size) {
            this.setSize(params.size);
        }
    },

    setPos:function (pos) {
        this._translate.setXYZ(pos);
    },

    setSize:function (size) {
        this._scale.setXYZ(size);
    },

    setRotate:function (rotate) {
        this._rotate.set(rotate);
    }
});
