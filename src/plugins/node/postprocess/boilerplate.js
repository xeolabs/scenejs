/**
 * Basic boilerplate postprocess effect
 *
 */
SceneJS.Types.addType("postprocess/boilerplate", {

    construct: function (params) {

        var colorTargetId = this.id + ".colorTarget";

        this.addNodes([

            // Stage 1
            // Render scene to color target
            {
                type: "stage",
                priority: 0,
                nodes: [
                    {
                        type: "colorTarget",
                        id: colorTargetId,
                        nodes: params.nodes
                    }
                ]
            },

            // Stage 2
            //
            {
                type: "stage",
                priority: 1,
                nodes: [
                    {
                        type: "flags",
                        flags: {
                            picking: false
                        },
                        nodes: [
                            {
                                type: "textureMap",
                                target: colorTargetId,
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
                                                    "void main() {",
                                                    "  gl_FragColor = texture2D( SCENEJS_uSampler0, vUv );",
                                                    "}"
                                                ]
                                            }
                                        ],
                                        nodes: [
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

