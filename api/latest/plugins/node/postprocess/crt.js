/**
 * Scanline postprocess effect
 *
 * Fragment shader taken from http://glslsandbox.com/e#19605.0
 */
SceneJS.Types.addType("postprocess/crt", {

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
                        nodes: params.nodes
                    }
                ]
            },
            {
                type: "stage",
                priority: 2,
                nodes: [
                    {
                        type: "texture",
                        target: colorTargetId,
                        nodes: [
                            {
                                type: "shader",
                                shaders: [
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
                                    {
                                        stage: "fragment",
                                        code: [
                                            "precision mediump float;",

                                            "uniform float time;",
                                            "uniform vec2 mouse;",
                                            "uniform vec2 resolution;",

                                            "uniform sampler2D SCENEJS_uSampler0;", // Colour target's texture
                                            "varying vec2 vUv;",

                                            "void main(void)",
                                            "{",
                                            "            vec2 uv = gl_FragCoord.xy / resolution.xy*2.-1.;",
                                            "            vec2 uv2=uv;",
                                            "            uv2*=1.+pow(length(uv*uv*uv*uv),4.)*.07;",
                                            "            vec3 color = vec3(0.8 + 0.2*uv.y);",
                                            "            vec3 rain=vec3(0.);",
                                            "            color=mix(rain,color,clamp(time*1.5-.5,0.,1.));",
                                            "            color*=1.-pow(length(uv2*uv2*uv2*uv2)*1.1,6.);",
                                            "            uv2.y *= resolution.y / 360.0;",
                                            "            color.r*=(.5+abs(.5-mod(uv2.y     ,.021)/.021)*.5)*1.5;",
                                            "            color.g*=(.5+abs(.5-mod(uv2.y+.007,.021)/.021)*1.5)*1.5;",
                                            "            color.b*=(.5+abs(.5-mod(uv2.y+.014,.021)/.021)*.5)*1.5;",
                                            "            color*=.9+rain*.35;",

                                            "            color *= sqrt(1.5-0.5*length(uv));",

                                            "   vec3 colorIn = texture2D( SCENEJS_uSampler0, vUv ).rgb;",
                                            "            gl_FragColor = vec4(colorIn * color,1.0);",
                                            "        }"
                                        ]
                                    }
                                ],
                                time: 1000.0,
                                mouse: [10, 10],
                                resolution: [1000, 1000],
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

