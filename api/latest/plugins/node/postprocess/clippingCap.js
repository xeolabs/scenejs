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
                                            clearColorBuffer: true
                                        },

                                        nodes: params.originNodes
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

                                nodes: params.capNodes
                                    
                            }
                        ]
                    }
                ]
            }

        ]);
        

    }
});