/**
 * Sawn-off smooth shader that uses only the position of the most recently defined light
 * source (the last light defined in the the light list of the current light node) and
 * the ambient, specular and diffuse components of a material node.
 *
 * SceneJS shaders always have separate projection, view and modelling matrices for efficiency.
 *
 * They provide two sets of functions to SceneJS: binders and setters. A binder function dynamically sets a GL buffer as
 * the source of some script attribute, such as a vertex or normal, while a setter sets the value of some attribute
 * within a script, such as a matrix.
 *
 * This is just to get you started!
 *
 * In practise, your shaders would want to use all of the lights, perhaps using something
 * like the virtualised lightsources technique described at:
 * http://gpwiki.org/index.php/OpenGL:Tutorials:Virtualized_Lights_with_OpenGL_and_GLSL
 *
 * @param cfg
 */

SceneJs.backends.installBackend(
        (function() {

            /** Default value for script matrices, injected on activation
             */
            var defaultMat4 = new WebGLFloatArray(SceneJs.math.identityMat4());
            var defaultNormalMat = new WebGLFloatArray([1, 0, 0, 0, 1, 0, 0, 0, 1]);
            var defaultMaterial = {
                diffuse: { r: 1.0, g: 1.0, b: 1.0 },
                ambient: { r: 1.0, g: 1.0, b: 1.0 }
            };

            return SceneJs.shaderBackend({

                type: 'simple-shader',

                fragmentShaders: [

                    "varying vec4 FragColor;" +

                    "void main(void) { " +
                    "      gl_FragColor = FragColor;  " +
                    "} "
                ],

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
                        //"uniform vec3 MaterialSpecular;" +

                    "varying vec4 FragColor;" +


                    "void main(void) {" +
                    "   vec4 v = vec4(Vertex, 1.0);" +

                    "   vec4 mv =     MMatrix * v;" + // Modelling transformation
                    "   vec4 vv =     VMatrix * mv;" + // Viewing transformation
                    "   gl_Position = PMatrix * vv;" + // Perspective transformation

                    "   vec3 nn = normalize(NMatrix * Normal);" +
                    "   vec3 lightDir = vec3(normalize(mv - LightPos));" +    // Lighting is done in model-space

                    "   float NdotL = max(dot(lightDir, nn), 0.0);" +

                    "   FragColor = vec4(NdotL * MaterialDiffuse + MaterialAmbient, 1.0);" +
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
                        context.uniformMatrix4fv(findVar(context, 'PMatrix'), false, mat || defaultMat4);
                    },

                    scene_ModelMatrix: function(context, findVar, mat) {
                        context.uniformMatrix4fv(findVar(context, 'MMatrix'), false, mat || defaultMat4);
                    },

                    scene_ViewMatrix: function(context, findVar, mat) {
                        context.uniformMatrix4fv(findVar(context, 'VMatrix'), false, mat || defaultMat4);
                    },

                    scene_NormalMatrix: function(context, findVar, mat) {
                        context.uniformMatrix3fv(findVar(context, 'NMatrix'), false, mat || defaultNormalMat);
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
                    },

                    scene_Normal: function(context, findVar, normals) {
                        if (normals) {
                            var loc = findVar(context, 'Normal');
                            context.vertexAttribPointer(loc, 3, context.FLOAT, false, 0, normals);
                            context.enableVertexAttribArray(loc);
                        }
                    },

                    scene_Vertex: function(context, findVar, vertices) {
                        if (vertices) { // No default
                            var loc = findVar(context, 'Vertex') ;
                            context.vertexAttribPointer(loc, 3, context.FLOAT, false, 0, vertices);
                            context.enableVertexAttribArray(loc);
                        }

                    }
                }
            });
        })()
        )
        ;


