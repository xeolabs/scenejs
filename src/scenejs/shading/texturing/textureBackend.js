/**
 * Shader backend for texturing
 */
SceneJs.backends.installBackend(
        (function() {

            /** Default value for script matrices, injected on activation
             */
            var defaultMat4;
            var defaultNormalMat;
            var defaultMaterial = {
                diffuse: { r: 1.0, g: 1.0, b: 1.0 },
                ambient: { r: 1.0, g: 1.0, b: 1.0 }
            };

            /* Lazy compute default matrixes so that when WebGLFloatArray missing the exception
             * will be thrown during scene rendering.
             */
            var getDefaultMat4 = function() {
                if (!defaultMat4) {
                    try {
                        defaultMat4 = new WebGLFloatArray(SceneJs.math.identityMat4());
                    } catch (e) {
                        throw new SceneJs.exceptions.WebGLNotSupportedException("Failed to find WebGL support (WebGLFloatArray)", e);
                    }
                }
                return defaultMat4;
            };

            var getDefaultNormalMat4 = function() {
                if (!defaultNormalMat) {
                    try {
                        defaultNormalMat = new WebGLFloatArray([1, 0, 0, 0, 1, 0, 0, 0, 1]);
                    } catch (e) {
                        throw new SceneJs.exceptions.WebGLNotSupportedException("Failed to find WebGL support (WebGLFloatArray)", e);
                    }
                }
                return defaultNormalMat;
            };

            return SceneJs.shaderBackend({

                type: 'texture-shader',

                vertexShaders: [
                    "attribute vec3 Vertex;" +
                    "attribute vec3 Normal;" +
                    "attribute vec2 aTextureCoord;" +

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
                    "   vTextureCoord = aTextureCoord;" +
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


                ],

                /**
                 * Binder functions - each of these dynamically sets a GL buffer as the value source for some script attribute.
                 */
                binders : {

                    /** Binds the given buffer to the Vertex attribute
                     */
                    bindVertexBuffer : function(context, findVar, buffer) {
                        var vertexAttribute = findVar(context, 'Vertex');
                        context.enableVertexAttribArray(vertexAttribute);
                        context.bindBuffer(context.ARRAY_BUFFER, buffer);
                        context.vertexAttribPointer(vertexAttribute, 3, context.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
                    },

                    /** Binds the given buffer to the Sampler attribute
                     */
                    bindTextureCoordBuffer : function(context, findVar, buffer) {
                        var texCoordAttribute = findVar(context, 'aTextureCoord');
                        context.enableVertexAttribArray(texCoordAttribute);
                        context.bindBuffer(context.ARRAY_BUFFER, buffer);
                        context.vertexAttribPointer(texCoordAttribute, 2, context.FLOAT, false, 0, 0);
                    },

                    /** Binds the given buffer to the Sampler attribute
                     */
                    bindTextureSampler : function(context, findVar, texture) {
                        var sampler = findVar(context, "Sampler");
                        context.activeTexture(context.TEXTURE0);
                        context.bindTexture(context.TEXTURE_2D, texture);
                        context.uniform1i(sampler, 0);
                    } ,

                    /** Binds the given buffer to the Normal attribute
                     */
                    bindNormalBuffer : function(context, findVar, buffer) {
                        var normalAttribute = findVar(context, 'Normal');
                        context.enableVertexAttribArray(normalAttribute);
                        context.bindBuffer(context.ARRAY_BUFFER, buffer);
                        context.vertexAttribPointer(normalAttribute, 3, context.FLOAT, false, 0, 0);
                    }
                },

                /** Setter functions - each of these sets the value of some attribute within a script, such as a matrix.
                 * When the shader is activated, these are all called in a batch, each with a null value, to prime their respective
                 *  script attributes with default values in case values are never supplied for them. So as you can see,
                 * they are responsible for setting a default value when none is given.
                 */
                setters : {

                    scene_ProjectionMatrix: function(context, findVar, mat) {
                        context.uniformMatrix4fv(findVar(context, 'PMatrix'), false, mat || getDefaultMat4());
                    },

                    scene_ModelMatrix: function(context, findVar, mat) {
                        context.uniformMatrix4fv(findVar(context, 'MMatrix'), false, mat || getDefaultMat4());
                    },

                    scene_ViewMatrix: function(context, findVar, mat) {
                        context.uniformMatrix4fv(findVar(context, 'VMatrix'), false, mat || getDefaultMat4());
                    },

                    scene_NormalMatrix: function(context, findVar, mat) {
                        context.uniformMatrix3fv(findVar(context, 'NMatrix'), false, mat || getDefaultNormalMat4());
                    },


                    scene_Material: function(context, findVar, m) {
                        m = m || defaultMaterial;
                        context.uniform3fv(findVar(context, 'MaterialAmbient'), [m.ambient.r, m.ambient.g, m.ambient.b]);
                        context.uniform3fv(findVar(context, 'MaterialDiffuse'), [m.diffuse.r, m.diffuse.g, m.diffuse.b]);
                        //                            context.uniform3fv(findVar(context, 'MaterialSpecular'), [m.specular.r, m.specular.g, m.specular.b]);
                    },

                    scene_Lights: function(context, findVar, lights) {
                        if (lights && lights.length > 0) {
                            var l = lights[0];
                            context.uniform4fv(findVar(context, 'LightPos'), [l.pos.x, l.pos.y, l.pos.z, 1.0]);
                        } else {
                            context.uniform4fv(findVar(context, 'LightPos'), [10.0, 0.0, -10.0, 1.0]);
                        }
                    }
                }
            });
        })()
        )
        ;


