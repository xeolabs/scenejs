/**
 * Provides a SceneJS.phongShading node by wrapping a call to the core SceneJS.shading node.
 *
 * As are provided by this node, a shading node takes a unique type ID and a list of fragment and vertex shader scripts.
 *
 * Note that SceneJS requires some of the variables in the scripts (such as for matrices, vertex arrays, lights,
 * materials, textures etc.) to have the names defined in SceneJS._webgl.shaderVarNames, so that it may locate them
 * when it wants to load and bind data.
 */
SceneJS.phongShading = function() {
    return SceneJS.shader.apply(
            this,
            SceneJS._utils.extendNodeArgs
                    (arguments, {

                        type: 'phong-shading', // Must be unique

                        vertexShaders: [

                            "attribute vec3 Normal;" +
                            "attribute vec3 Vertex;" +

                            "attribute vec2 TextureCoord;" +

                            "uniform vec4 LightPos;" +

                            'uniform mat4 PMatrix; ' +
                            'uniform mat4 VMatrix; ' +
                            'uniform mat4 MMatrix; ' +
                            'uniform mat3 NMatrix; ' +

                            "uniform vec3 MaterialAmbient;" +
                            "uniform vec3 MaterialDiffuse;" +

                            "varying vec2 vTextureCoord;" +
                            "varying vec3 vLightWeighting; " +

                            "void main(void) {" +
                            "   vec4 mv =     MMatrix * vec4(Vertex, 1.0);" + // Modelling transformation
                            "   vec4 vv =     VMatrix * mv;" + // Viewing transformation
                            "   gl_Position = PMatrix * vv;" + // Perspective transformation
                            "   vec3 nn = normalize(NMatrix * Normal);" +
                            "   vec3 lightDir = vec3(normalize(mv - LightPos));" + // Lighting is done in model-space
                            "   float directionalLightWeighting = max(dot(lightDir, nn), 0.0);" +
                            "   vLightWeighting = MaterialAmbient + MaterialDiffuse * directionalLightWeighting;" +
                            "   vTextureCoord = TextureCoord;" +
                            "}"
                        ],

                        fragmentShaders: [
                            "varying vec2 vTextureCoord;" +
                            "uniform sampler2D Sampler;" +
                            "varying vec3 vLightWeighting; " +
                            "void main(void) {" +
                            "   vec4 textureColor = texture2D(Sampler, vec2(vTextureCoord.s, 1.0 - vTextureCoord.t)); " +
                            "   gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a); " +
                            "}"
                        ]
                    }));
};
