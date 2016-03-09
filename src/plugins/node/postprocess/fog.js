/**
 * Depth-of-Field postprocess effect
 *
 * IN DEVELOPMENT
 *
 */
SceneJS.Types.addType("postprocess/dof", {

    construct: function (params) {

        // Unique IDs for the render target nodes
        var colorTarget = this.id + ".colorTarget";
        var colorTarget2 = this.id + ".colorTarget2";
        var depthTarget = this.id + ".depthTarget";


        this.addNodes([

            // Stage 1
            // Render scene to color and depth targets
            {
                type: "stage",
                priority: 1,
                pickable: true,

                nodes: [

                    // Output color target
                    {
                        type: "colorTarget",
                        id: colorTarget,

                        nodes: [

                            // Output depth target
                            {
                                type: "depthTarget",
                                id: depthTarget,

                                // The scene nodes
                                nodes: params.nodes
                            }
                        ]
                    }
                ]
            },

            // Debug stage - renders the depth buffer to the canvas
//            {
//                type: "stage",
//                priority: 1.2,
//                nodes: [
//                    {
//                        //       type: "depthTarget/render",
//                        target: depthTarget
//                    }
//                ]
//            },

            // Stage 2
            // Render scene with custom shader using color and depth targets as textures
            {
                type: "stage",
                priority: 2,

                nodes: [

                    // Input color target
                    {
                        type: "texture",
                        target: colorTarget,

                        nodes: [

                            // Input depth target
                            {
                                type: "texture",
                                target: depthTarget,

                                nodes: [

                                    // Horizontal blur shader
                                    {
                                        type: "shader",
                                        coreId: "xx",
                                        shaders: [

                                            // Vertex shader simply stages through vertex position and UV
                                            {
                                                stage: "vertex",
                                                code: [
                                                    "attribute vec3 SCENEJS_aVertex;",
                                                    "attribute vec2 SCENEJS_aUVCoord0;",
                                                    "varying vec2 vUv;",
                                                    "void main () {",
                                                    "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                                                    "    vUv = SCENEJS_aUVCoord0;",
                                                    "}"
                                                ]
                                            },

                                            // Fragment shader
                                            {
                                                stage: "fragment",
                                                code: [
                                                    "precision highp float;",

                                                    "uniform sampler2D SCENEJS_uSampler0;", // Colour target's texture
                                                    "uniform sampler2D SCENEJS_uSampler1;", // Depth target's texture

                                                    /// Unpack an RGBA pixel to floating point value.
                                                    "float unpack (vec4 colour) {",
                                                    "   const vec4 bitShifts = vec4(1.0,",
                                                    "   1.0 / 255.0,",
                                                    "   1.0 / (255.0 * 255.0),",
                                                    "   1.0 / (255.0 * 255.0 * 255.0));",
                                                    "   return dot(colour, bitShifts);",
                                                    "}",

                                                    "void main () {",
                                                    "   float depth = unpack(texture2D(SCENEJS_uSampler1, vUv));",
                                                    "   gl_FragColor = depth * texture2D(SCENEJS_uSampler0, vUv);",
                                                    "}"
                                                ]
                                            }
                                        ],

                                        params: {
                                        },

                                        nodes: [

                                            // Quad primitive, implemented by plugin at
                                            // http://scenejs.org/api/latest/plugins/node/geometry/quad.js
                                            {
                                                type: "geometry/quad"
                                            }
                                        ]
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

