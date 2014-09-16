/**
 * Scanline postprocess effect
 *
 */
SceneJS.Types.addType("postprocess/scanlines", {

    construct: function (params) {

        var colorTargetId = this.id + ".colorTarget";

        this.addNodes([
            {
                type: "stage",
                priority: 1,
                pickable: true,

                nodes: [
                    {
                        type: "colorTarget",
                        id: colorTargetId,

                        nodes: [

                            // Leaf node
                            {
                                id: this.id + ".leaf",

                                // The child nodes we want to render with this effect
                                nodes: params.nodes
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
                        type: "textureMap",
                        target: colorTargetId,
                        nodes: [
                            {
                                type: "flags",
                                flags: {
                                    picking: false
                                },
                                nodes: [
                                    {
                                        type: "shader",
                                        shaders: [
                                            {
                                                stage: "vertex",
                                                code: [
                                                    "attribute vec3 SCENEJS_aVertex;",
                                                    "attribute vec2 SCENEJS_aUVCoord;",
                                                    "varying vec2 vUv;",
                                                    "void main () {",
                                                    "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                                                    "    vUv = SCENEJS_aUVCoord;",
                                                    "}"
                                                ]
                                            },
                                            {
                                                stage: "fragment",
                                                code: [
                                                    "precision mediump float;",
                                                    "uniform sampler2D SCENEJS_uSampler0;",
                                                    "varying vec2 vUv;",
                                                    "void main () {",
                                                    "   float m = mod(gl_FragCoord.y, 4.0);",
                                                    "   if (m < 1.5) {",
                                                    "       gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
                                                    "   } else if (m < 2.0) {",
                                                    "       gl_FragColor = vec4(0.2, 0.2, 0.2, 1.0);",
                                                    "   } else if (m < 2.5) {",
                                                    "       gl_FragColor = vec4(0.2, 0.2, 0.2, 1.0);",
                                                    "   } else {",
                                                    "       gl_FragColor = texture2D(SCENEJS_uSampler0, vUv);",
                                                    "   }",
                                                    "}"
                                                ]
                                            }
                                        ],
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

