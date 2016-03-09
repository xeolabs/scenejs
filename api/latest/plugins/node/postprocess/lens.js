/**
 * Lens distortion blur
 *
 * IN DEVELOPMENT
 */
SceneJS.Types.addType("postprocess/lens", {

    construct: function (params) {

        // Unique ID for the render target node
        var colorTarget = this.id + ".colorTarget";

        this.addNodes([

            // Stage 1
            // Render scene to a color target
            {
                type: "stage",
                priority: 1,
                pickable: true,

                nodes: [

                    // Output color target
                    {
                        type: "colorTarget",
                        id: colorTarget,

                        // The scene nodes
                        nodes: params.nodes
                    }
                ]
            },

            // Stage 2
            // Render the color target
            {
                type: "stage",
                priority: 2,
                nodes: [

                    // Input color target
                    {
                        type: "texture",
                        target: colorTarget,
                        nodes: [

                            // Shader
                            {
                                type: "shader",
                                shaders: [

                                    // Vertex stage just passes through the positions and UVs
                                    {
                                        stage: "vertex",
                                        code: [
                                            "attribute vec3 SCENEJS_aVertex;",
                                            "attribute vec2 SCENEJS_aUVCoord0;",

                                            "varying vec2 vUv;",
                                            "varying vec3 vVertexPosition;",

                                            "void main () {",
                                            "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                                            "    vUv = SCENEJS_aUVCoord0;",
                                            "}"
                                        ]
                                    },

                                    // Fragment shader applies distortion effect
                                    // TODO: https://github.com/yazk/yaztekWGL/blob/master/media/shaders/distort_fragment.glsl
                                    {
                                        stage: "fragment",
                                        code: [
                                            "precision highp float;",

                                            "uniform sampler2D SCENEJS_uSampler0;",
                                            "uniform vec2 LensCenter;",
                                            "uniform vec2 ScreenCenter;",
                                            "uniform vec2 Scale;",
                                            "uniform vec2 ScaleIn;",
                                            "uniform vec4 HmdWarpParam;",

                                            "varying vec2 vUv;",

                                            "vec2 HmdWarp(vec2 in01) {",
                                            "	vec2 theta = (in01 - LensCenter) * ScaleIn;",
                                            "	float rSq = theta.x * theta.x + theta.y * theta.y;",
                                            "	vec2 rvector = theta * (HmdWarpParam.x + HmdWarpParam.y * rSq +",
                                            "		HmdWarpParam.z * rSq * rSq +",
                                            "		HmdWarpParam.w * rSq * rSq * rSq);",
                                            "	return LensCenter + Scale * rvector;",
                                            "}",

                                            "void main(){",

                                            "	vec2 tc = HmdWarp(vUv);",
                                            "	if (any(bvec2(clamp(tc,ScreenCenter-vec2(0.25,0.5), ScreenCenter+vec2(0.25,0.5)) - tc))) {",
                                            "		gl_FragColor = vec4(vec3(0.0), 1.0);",
                                            "		return;",
                                            "	}",
                                            "	gl_FragColor = texture2D(SCENEJS_uSampler0, vUv);",
                                            "}"
                                        ]
                                    }
                                ],

                                params: {
                                    "LensCenter": [0.5, 0.5],
                                    "ScreenCenter": [0.5, 0.5],
                                    "Scale": [1, 1],
                                    "ScaleIn": [1, 1],
                                    "HmdWarpParam": [1, 1, 1, 1]
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
        ]);
    }
});

