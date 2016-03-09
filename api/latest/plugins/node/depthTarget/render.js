/**
 * Renders a depthTarget to the entire canvas, drawing each pixel as greyscale.
 *
 * @author xeolabs / http://xeolabs.com
 */
SceneJS.Types.addType("depthTarget/render", {

    construct: function (params) {
        this.addNode({
            type: "texture",
            target: params.target,
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
                                "precision highp float;",
                                "uniform sampler2D SCENEJS_uSampler0;", // Variable for our texture
                                "varying vec2 vUv;",
                                "float unpack (vec4 colour) {",
                                "    const vec4 bitShifts = vec4(1.0,",
                                "    1.0 / 255.0,",
                                "    1.0 / (255.0 * 255.0),",
                                "    1.0 / (255.0 * 255.0 * 255.0));",
                                "    return dot(colour, bitShifts);",
                                "}",
                                "void main () {",
                                "   float depth = unpack(texture2D(SCENEJS_uSampler0, vUv));",
                                "   gl_FragColor = vec4(depth, depth, depth, 1.0);",
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
        });
    }
});

