/**
 * 
 */
SceneJS.Types.addType("postprocess/clippingCap", {

    construct: function (params) {
        
        //var colorTargetId = this.id + ".colorTarget";

        this._clips = params.clips != undefined ? params.clips : [{x: 0, y: 0, z: 1, dist: 0, mode: "inside"}];

        var frontClippingFS = [
            "precision mediump float;",
            "uniform bool SCENEJS_uClipping;",
            "uniform vec3 SCENEJS_uWorldEye;",
            "uniform vec3 SCENEJS_uWorldLook;",
            "uniform vec3 SCENEJS_uMaterialColor;"//,
        ];

        var lenClips = this._clips.length;
        var i;
        for (i = 0; i < lenClips; i++) {
            frontClippingFS.push("uniform float SCENEJS_uClipMode" + i + ";");
            frontClippingFS.push("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
        }

        frontClippingFS.push("varying vec4 SCENEJS_vWorldVertex;");
        frontClippingFS.push("varying vec2 vUv;");

        frontClippingFS.push("void main () {");
        
        //frontClippingFS.push("if (SCENEJS_uClipping) {");

        frontClippingFS.push("  float dist = 0.0;");

        //for (i = 0; i < 1; i++) {
        for (i = 0; i < lenClips; i++) {
            frontClippingFS.push("  if (SCENEJS_uClipMode" + i + " != 0.0) {");
            frontClippingFS.push("    if (dot(SCENEJS_uWorldLook - SCENEJS_uWorldEye, SCENEJS_uClipNormalAndDist" + i + ".xyz) < -SCENEJS_uClipNormalAndDist" + i + ".w) {");
            frontClippingFS.push("      dist += clamp(dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
            frontClippingFS.push("    }");
            frontClippingFS.push("  }");
        }

        frontClippingFS.push("  if (dist > 0.0) { discard; }");

        //frontClippingFS.push("}");


        frontClippingFS.push("  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);");


        frontClippingFS.push("}");




        this.addNodes([


            // TODO: use the simplest fragment shader (no shading needed, just need to discard and write stencil buffer)

            // Stage 1
            // Back face frag -> stencil buffer +1
            // Front face frag -> stencil buffer -1
            // Use Front face clipping plane only
            {
                type: "stage",
                priority: 1,

                nodes: [
                    {
                        type: "depthBuffer",
                        //enabled: false,

                        clearDepth: 1.0,
                        enabled: true,
                        depthFunc: "lequal",
                        clear: true,

                        nodes: [
                            {
                                type: "stencilBuffer",

                                enabled: true,
                                clear: true,
                                clearStencil: 128,
                                stencilFunc: {
                                    func: "always",
                                    ref: 128, 
                                    mask: 0xff
                                },
                                stencilOp: {
                                    front: {
                                        sfail: "keep",
                                        dpfail: "decr", 
                                        dppass: "decr"
                                    },
                                    back: {
                                        sfail: "keep",
                                        dpfail: "incr", 
                                        dppass: "incr"
                                    }
                                },


                                nodes: [
                                    {
                                        type: "clips",
                                        clips: this._clips,

                                        nodes: [
                                            {
                                                // type: "flags",
                                                // flags: {
                                                //     frontClippingOnly: true
                                                // },
                                                type: "shader",
                                                shaders: [
                                                    {
                                                        stage: "fragment",
                                                        code: frontClippingFS
                                                    }
                                                ],

                                                nodes: params.nodes

                                            }
                                        ]

                                        
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            
            ,
            {
                type: "stage",
                priority: 2,

                nodes: [
                    {
                        type: "depthBuffer",

                        clear: true,

                        nodes: [
                            {
                                type: "clips",
                                clips: this._clips,

                                nodes: [
                                    {
                                        type: "flags",
                                        flags: {
                                            backfaces: false,
                                            //clearColorBuffer: true
                                        },

                                        nodes: params.nodes
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            ,
            // Stage 3
            // Draw Caps with stencil test
            // Draw the origin geometry with inner volume texture (tissue)
            // and depth func set to GREATER to draw closest object to the clipping plane
            // TODO: custom shader
            {
                type: "stage",
                priority: 3,

                nodes: [
                    
                    {
                        type: "depthBuffer",
                        enabled: true,
                        //enabled: false,
                        
                        clear: true,
                        //clear: false,

                        clearDepth: 0.0,
                        depthFunc: "gequal",
                        
                        // depthFunc: "lequal",

                        nodes: [
                            {
                                type: "stencilBuffer",

                                enabled: true,
                                clear: false,
                                stencilFunc: {
                                    func: "less",
                                    ref: 128,
                                    mask: 0xff
                                },
                                stencilOp: {
                                    sfail: "keep", 
                                    dpfail: "keep",
                                    dppass: "keep"
                                },

                                nodes: [
                                    {
                                        type: "shader",
                                        shaders: [
                                            {
                                                stage: "fragment",
                                                code: [
                                                    "precision mediump float;",
                                                    "uniform vec3  SCENEJS_uMaterialColor;",
                                                    "varying vec2 vUv;",
                                                    "void main () {",
                                                    "   gl_FragColor = vec4(SCENEJS_uMaterialColor, 1.0);",
                                                    "}"
                                                ]
                                            }
                                        ],
                                        nodes: params.capNodes
                                    }
                                ]

                                //nodes: params.capNodes

                                // nodes: [
                                //     {
                                //         type: "clips",
                                //         clips: this._clips,

                                //         nodes: [
                                //             {
                                //                 type: "flags",
                                //                 flags: {
                                //                     backClippingOnly: true
                                //                 },

                                //                 nodes: params.capNodes
                                //             }
                                //         ]
                                //     }
                                // ]
                                    
                            }
                        ]
                    }
                ]
            }

        ]);
        


        //this._shader.setParams({SCENEJS_uWorldEye: this._core.look.eye});


    }
});