/**
 * 
 */
SceneJS.Types.addType("postprocess/clippingCap", {

    construct: function (params) {

        this._clips = params.clips != undefined ? params.clips : [{x: 0, y: 0, z: 1, dist: 0, mode: "inside"}];

        var lenClips = this._clips.length;
        var i;

        // Build custom clipping shader

        var frontClippingFS = [
            "precision highp float;\n",
            "uniform vec3 SCENEJS_uWorldEye;\n",
            "uniform vec3 SCENEJS_uWorldLook;\n",
            "uniform vec3 SCENEJS_uMaterialColor;\n"//,
        ];

        
        for (i = 0; i < lenClips; i++) {
            frontClippingFS.push("uniform float SCENEJS_uClipMode" + i + ";\n");
            frontClippingFS.push("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";\n");
        }

        frontClippingFS.push("varying vec4 SCENEJS_vWorldVertex;\n");
        frontClippingFS.push("varying vec2 vUv;\n");

        frontClippingFS.push("void main () {\n");

        frontClippingFS.push("  float dist = 0.0;\n");

        for (i = 0; i < lenClips; i++) {
            frontClippingFS.push("  if (SCENEJS_uClipMode" + i + " != 0.0) {");
            frontClippingFS.push("    if (dot(SCENEJS_uWorldLook - SCENEJS_uWorldEye, SCENEJS_uClipNormalAndDist" + i + ".xyz) < -SCENEJS_uClipNormalAndDist" + i + ".w) {");
            frontClippingFS.push("      dist += clamp(dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
            frontClippingFS.push("    }");
            frontClippingFS.push("  }");
        }

        frontClippingFS.push("  if (dist > 0.0) { discard; }\n");

        frontClippingFS.push("  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n");

        frontClippingFS.push("}");


        this.addNodes([
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
            // Stage 2
            // Draw the actual clipped geometry
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
            // Draw the capNodes as the caps
            // With certain knowledge of the clipping planes, we can use appropriate 
            // capNodes geometry to get rid of the overlapping clipping planes artifacts
            {
                type: "stage",
                priority: 3,

                nodes: [
                    
                    {
                        type: "depthBuffer",
                        enabled: true,
                        clear: true,

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
                                                    "void main () {",
                                                    "   gl_FragColor = vec4(SCENEJS_uMaterialColor, 1.0);",
                                                    "}"
                                                ]
                                            }
                                        ],

                                        nodes: params.capNodes
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);
    }
});