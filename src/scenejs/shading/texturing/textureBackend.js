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
                          if (typeof WebGLFloatArdray == 'undefined') {
                              throw new SceneJs.exceptions.WebGLNotSupportedException("Failed to find WebGL support (WebGLFloatArray)");
                          }
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
                    "   gl_Position = PMatrix * MMatrix * VMatrix * vec4(Vertex, 1.0);" +
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
                    bindTextureBuffer : function(context, findVar, buffer) {
                        var samplerAttribute = findVar(context, 'Sampler');
                        context.activeTexture(gl.TEXTURE0);
                        context.bindTexture(context.TEXTURE_2D, buffer);
                        context.uniform1i(samplerAttribute, 0);
                    },

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
                    }
                }
            });
        })()
        )
        ;


