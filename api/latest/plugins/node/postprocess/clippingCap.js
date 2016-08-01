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
            {
                type: "stage",
                priority: 1,

                nodes: [
                    {
                        type: "depthBuffer",
                        id: "myDepthBuf",
                        //enabled: false,

                        clearDepth: 1.0,
                        enabled: true,
                        depthFunc: "less",
                        //depthFunc: "greater",

                        nodes: [
                            {
                                type: "stencilBuffer",

                                enabled: true,
                                clear: true,
                                clearStencil: 0,
                                stencilFunc: {
                                    //func: "lequal",
                                    func: "always",
                                    ref: 0, 
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

                                        nodes: params.originNodes
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },

            // Stage 2
            // Draw Caps with stencil test
            // Draw the origin geometry with inner volume texture (tissue)
            // and depth func set to GREATER to draw closest object to the clipping plane
            {
                type: "stage",
                priority: 2,

                clearColor: true,
                clearDepth: true,

                nodes: [
                    {
                        type: "depthBuffer",
                        enabled: true,
                        clear: true,
                        
                        clearDepth: 0.0,
                        depthFunc: "greater",

                        nodes: [
                            {
                                type: "stencilBuffer",

                                enabled: true,
                                clear: false,
                                stencilFunc: {
                                    func: "less", 
                                    ref: 0,
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
            },

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