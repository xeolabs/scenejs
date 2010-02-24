/**
 * Provides a SceneJS.basicShading node by wrapping a call to the core SceneJS.shading node.
 *
 * As are provided by this node, a shading node takes a unique type ID and a list of fragment and vertex shader scripts.
 *
 * Note that SceneJS requires some of the variables in the scripts (such as for matrices, vertex arrays, lights,
 * materials, textures etc.) to have the names defined in SceneJS._webgl.shaderVarNames, so that it may locate them
 * when it wants to load and bind data.
 */
SceneJS.basicShading = function() {
    return SceneJS.shader.apply(
            this,
            SceneJS._utils.extendNodeArgs
                    (arguments, {

                        type: 'basic-shading', // Must be unique

                        vertexShaders: [
                            "attribute vec3 Vertex;" +
                            "attribute vec3 Normal;" +

                            "uniform vec4 LightPos;" +

                            'uniform mat4 PMatrix; ' +
                            'uniform mat4 VMatrix; ' +
                            'uniform mat4 MMatrix; ' +
                            'uniform mat3 NMatrix; ' +

                            "uniform vec3 MaterialAmbient;" +
                            "uniform vec3 MaterialDiffuse;" +

                            "varying vec4 FragColor;" +

                            "void main(void) {" +
                            "   vec4 v = vec4(Vertex, 1.0);" +

                            "   vec4 mv =     MMatrix * v;" + // Modelling transformation
                            "   vec4 vv =     VMatrix * mv;" + // Viewing transformation
                            "   gl_Position = PMatrix * vv;" + // Perspective transformation

                            "   vec3 nn = normalize(NMatrix * Normal);" +
                            "   vec3 lightDir = vec3(normalize(mv - LightPos));" + // Lighting is done in model-space

                            "   float NdotL = max(dot(lightDir, nn), 0.0);" +

                            "   FragColor = vec4(NdotL * MaterialDiffuse + MaterialAmbient, 1.0);" +
                            "}"
                        ],

                        fragmentShaders: [
                            "varying vec4 FragColor;" +

                            "void main(void) { " +
                            "      gl_FragColor = FragColor;  " +
                            "} "
                        ]
                    })
            );
};
