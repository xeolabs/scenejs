/**
 * 
 */
SceneJS.Types.addType("postprocess/clippingCap", {

    construct: function (params) {
        
        //var colorTargetId = this.id + ".colorTarget";

        this._clips = params.clips != undefined ? params.clips : [{x: 0, y: 0, z: 1, dist: 0, mode: "inside"}];




        this.addNodes([


            // TODO: use the simplest fragment shader (no shading needed, just need to discard and write stencil buffer)

            // Stage 1
            // Back face frag -> stencil buffer +1
            // Front face frag -> stencil buffer -1
            // Front face clipping plane
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
                        //depthFunc: "greater",

                        nodes: [
                            {
                                type: "stencilBuffer",

                                enabled: true,
                                clear: true,
                                clearStencil: 128,
                                stencilFunc: {
                                    //func: "lequal",
                                    func: "always",
                                    ref: 128, 
                                    mask: 0xff
                                },
                                stencilOp: {
                                    front: {
                                        //sfail: "decr",
                                        sfail: "keep",
                                        dpfail: "keep", 
                                        dppass: "decr"
                                        //dppass: "zero"
                                    },
                                    back: {
                                        sfail: "keep",
                                        dpfail: "keep", 
                                        dppass: "incr"
                                    }
                                },


                                nodes: [
                                    {
                                        type: "clips",
                                        clips: this._clips,

                                        nodes: [
                                            {
                                                type: "flags",
                                                flags: {
                                                    frontClippingOnly: true
                                                },

                                                nodes: params.originNodes
                                            }
                                        ]

                                        
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },

            {
                type: "stage",
                priority: 2,

                nodes: [
                    {
                        type: "depthBuffer",
                        //enabled: false,

                        clearDepth: 1.0,
                        enabled: true,
                        depthFunc: "lequal",
                        clear: true,
                        //depthFunc: "greater",

                        nodes: [
                            {
                                type: "stencilBuffer",

                                clear: false,
                                enabled: true,
                                stencilFunc: {
                                    //func: "lequal",
                                    func: "always",
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
                                        type: "clips",
                                        clips: this._clips,


                                        //nodes: params.originNodes

                                        nodes: [
                                            {
                                                type: "flags",
                                                flags: {
                                                    frontClippingOnly: false
                                                },

                                                //nodes: params.originNodes
                                                nodes: [
                                                    {
                                        type: "material",
                                        color: {r: 0.0, g: 0.6, b: 0.0},

                                        nodes: [

                                            // Torus primitive, implemented by plugin at http://scenejs.org/api/latest/plugins/node/geometry/torus.js
                                            {
                                                type: "geometry/torus",
                                                radius: 1.0,
                                                tube: 0.30,
                                                segmentsR: 60,
                                                segmentsT: 40,
                                                arc: Math.PI * 2
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
            },

            // Stage 3
            // Draw Caps with stencil test
            // Draw the origin geometry with inner volume texture (tissue)
            // and depth func set to GREATER to draw closest object to the clipping plane
            {
                type: "stage",
                priority: 3,

                // clearColor: true,
                // clearDepth: true,

                nodes: [
                    // {
                    //     type: "shader", 
                    //     shaders: [
                    //         // Vertex stage just passes through the positions and UVs
                    //         {
                    //             stage: "vertex",
                    //             code: [
                    //                 "attribute vec3 SCENEJS_aVertex;",
                    //                 "attribute vec2 SCENEJS_aUVCoord0;",
                    //                 "varying vec2 vUv;",
                    //                 "void main () {",
                    //                 "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                    //                 "    vUv = SCENEJS_aUVCoord0;",
                    //                 "}"
                    //             ]
                    //         },

                    //         {
                    //             stage: "fragment", 
                    //             code: [
                    //                 "precision mediump float;",
                    //                 "uniform sampler2D SCENEJS_uSampler0;",
                    //                 "uniform vec3 SCENEJS_uWorldEye;",
                    //                 "uniform vec3 SCENEJS_uWorldLook",
                    //                 "varying vec2 vUv;",
                    //                 "void main () {",
                    //                 "   gl_FragColor = texture2D(SCENEJS_uSampler0, vUv);",
                    //                 "}"
                    //             ]
                    //         }
                    //     ]
                    // },
                    {
                        type: "depthBuffer",
                        enabled: true,
                        
                        clear: true,
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
                                    //func: "always", 
                                    ref: 128,
                                    mask: 0xff
                                },
                                stencilOp: {
                                    sfail: "keep", 
                                    dpfail: "keep",
                                    dppass: "keep"
                                },

                                nodes: params.capNodes
                                    
                            }
                        ]
                    }
                ]
            }
            
            //,

            // // Stage 3
            // // Draw the original objects
            // {
            //     type: "stage", 
            //     priority: 3,

            //     nodes: [
            //         {
            //             type: "depthBuffer",
            //             enabled: true,
            //             clearDepth: 1.0,
            //             depthFunc: "less",
            //             clear: true,

            //             nodes: [
            //                 {
            //                     type: "stencilBuffer",

            //                     enabled: true,
            //                     clear: false,
            //                     stencilFunc: {
            //                         func: "equal", 
            //                         ref: 0,
            //                         mask: 0xff
            //                     },
            //                     stencilOp: {
            //                         sfail: "keep", 
            //                         dpfail: "keep",
            //                         dppass: "keep"
            //                     },

            //                     nodes: [
            //                         {
            //                             type: "clips",
            //                             clips: this._clips,

            //                             nodes: params.originNodes
            //                         }
            //                     ]
            //                 }
            //             ]
            //         }
            //     ]
            // }

        ]);

        
        
        
        
        



        

    }
});