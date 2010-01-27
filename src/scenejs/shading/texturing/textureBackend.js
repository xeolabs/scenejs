/**
 * Shader backend for texturing
 */
SceneJs.backends.installBackend(
        (function() {

            /** Default value for script matrices, injected on activation
             */
            var defaultMat4;

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


            return SceneJs.shaderBackend({

                type: 'texture-shader',

                fragmentShaders: [
                    "varying vec2 vTextureCoord;" +
                    "uniform sampler2D Sampler;" +
                    "void main(void) {" +
                    "gl_FragColor = texture2D(Sampler, vec2(vTextureCoord.s, vTextureCoord.t));" +
                    "}"
                ],

                vertexShaders: [
                    "attribute vec3 Vertex;" +
                    "attribute vec2 aTextureCoord;" +

                    'uniform mat4 PMatrix; ' +
                    'uniform mat4 VMatrix; ' +
                    'uniform mat4 MMatrix; ' +

                    "varying vec2 vTextureCoord;" +

                    "void main(void) {" +
                    "   vec4 mv =     MMatrix * vec4(Vertex, 1.0);" + // Modelling transformation
                    "   vec4 vv =     VMatrix * mv;" + // Viewing transformation
                    "   gl_Position = PMatrix * vv;" + // Perspective transformation
                    "   vTextureCoord = aTextureCoord;" +
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
                        //                        var normalAttribute = findVar(context, 'Normal');
                        //                        context.enableVertexAttribArray(normalAttribute);
                        //                        context.bindBuffer(context.ARRAY_BUFFER, buffer);
                        //                        context.vertexAttribPointer(normalAttribute, 3, context.FLOAT, false, 0, 0);
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
                    }
                }
            });
        })()
        )
        ;


