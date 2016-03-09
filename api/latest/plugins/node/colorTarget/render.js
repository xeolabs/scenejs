/**
 * Renders a colorTarget to the entire canvas.
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>This is really just for debugging effects pipelines that use colorTargets.</p>
 */
SceneJS.Types.addType("colorTarget/render", {

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
                                "precision mediump float;",
                                "uniform sampler2D SCENEJS_uSampler0;",
                                "varying vec2 vUv;",
                                "void main () {",
                                "   vec4 color  = texture2D(SCENEJS_uSampler0, vUv);",
                                "   gl_FragColor = color;",
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

