/** Private WebGL support classes
 */
SceneJS._webgl = {

    /** IDs of supported WebGL canvas contexts
     */
    contextNames : ["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /** Maps SceneJS node parameter names to WebGL enum names
     */
    enumMap : {
        funcAdd: "FUNC_ADD",
        funcSubtract: "FUNC_SUBTRACT",
        funcReverseSubtract: "FUNC_REVERSE_SUBTRACT",
        zero : "ZERO",
        one : "ONE",
        srcColor:"SRC_COLOR",
        oneMinusSrcColor:"ONE_MINUS_SRC_COLOR",
        dstColor:"DST_COLOR",
        oneMinusDstColor:"ONE_MINUS_DST_COLOR",
        srcAlpha:"SRC_ALPHA",
        oneMinusSrcAlpha:"ONE_MINUS_SRC_ALPHA",
        dstAlpha:"DST_ALPHA",
        oneMinusDstAlpha:"ONE_MINUS_DST_ALPHA",
        contantColor:"CONSTANT_COLOR",
        oneMinusConstantColor:"ONE_MINUS_CONSTANT_COLOR",
        constantAlpha:"CONSTANT_ALPHA",
        oneMinusConstantAlpha:"ONE_MINUS_CONSTANT_ALPHA",
        srcAlphaSaturate:"SRC_ALPHA_SATURATE",
        front: "FRONT",
        back: "BACK",
        frontAndBack: "FRONT_AND_BACK",
        never:"NEVER",
        less:"LESS",
        equal:"EQUAL",
        lequal:"LEQUAL",
        greater:"GREATER",
        notequal:"NOTEQUAL",
        gequal:"GEQUAL",
        always:"ALWAYS",
        cw:"CW",
        ccw:"CCW",
        linear: "LINEAR",
        nearest: "NEAREST",
        linearMipMapNearest : "LINEAR_MIPMAP_NEAREST",
        nearestMipMapNearest : "NEAREST_MIPMAP_NEAREST",
        nearestMipMapLinear: "NEAREST_MIPMAP_LINEAR",
        linearMipMapLinear: "LINEAR_MIPMAP_LINEAR",
        repeat: "REPEAT",
        clampToEdge: "CLAMP_TO_EDGE",
        mirroredRepeat: "MIRRORED_REPEAT",
        alpha:"ALPHA",
        rgb:"RGB",
        rgba:"RGBA",
        luminance:"LUMINANCE",
        luminanceAlpha:"LUMINANCE_ALPHA",
        textureBinding2D:"TEXTURE_BINDING_2D",
        textureBindingCubeMap:"TEXTURE_BINDING_CUBE_MAP",
        compareRToTexture:"COMPARE_R_TO_TEXTURE" // Hardware Shadowing Z-depth
    },

    /**
     * Names that SceneJS expects for variables in shader scripts.
     *
     * Your custom shaders must use these names for their variables
     * in order for SceneJS to find them.
     */
    shaderVarNames : {
        VERTEX : "Vertex",
        NORMAL : "Normal",
        TEXTURE_COORD : "TextureCoord",
        PROJECTION_MATRIX : "PMatrix",
        VIEW_MATRIX : "VMatrix",
        MODEL_MATRIX : "MMatrix",
        NORMAL_MATRIX : "NMatrix",
        SAMPLER : "Sampler",
        MATERIAL_AMBIENT: "MaterialAmbient",
        MATERIAL_DIFFUSE: "MaterialDiffuse",
        MATERIAL_SPECULAR: "MaterialSpecular",
        MATERIAL_SHININESS: "MaterialShininess",
        LIGHT_POS: "LightPos"
    },

    /**
     * SceneJS built-in default shaders, used when no
     * shader nodes are defined in a scene graph
     */
    defaultShaders: {

        /* Default shader with single light source and no texturing
         */
        defaultBasicShader :{ // TODO: multiple diretional light sources, specular material
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
        },

        /* Default shader with texturing        
         */
        defaultTextureShader : {
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
        },

        defaultDirectionalShader : {
            vertexShaders: [
                "varying vec2 vTextureCoord; " +
                "varying vec4 vTransformedNormal; " +
                "varying vec4 vPosition; " +

                "uniform float uMaterialShininess; " +

                "uniform bool uShowSpecularHighlights; " +
                "uniform bool uUseLighting; " +
                "uniform bool uUseTextures; " +

                "uniform vec3 uAmbientColor; " +

                "uniform vec3 uPointLightingLocation; " +
                "uniform vec3 uPointLightingSpecularColor; " +
                "uniform vec3 uPointLightingDiffuseColor; " +

                "uniform sampler2D uSampler; " +


                "void main(void) { " +
                "   vec3 lightWeighting; " +
                "   if (!uUseLighting) { " +
                "       lightWeighting = vec3(1.0, 1.0, 1.0); " +
                "   } else { " +
                "       vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz); " +
                "       vec3 normal = normalize(vTransformedNormal.xyz); " +

                "       float specularLightWeighting = 0.0; " +
                "       if (uShowSpecularHighlights) { " +
                "           vec3 eyeDirection = normalize(-vPosition.xyz); " +
                "           vec3 reflectionDirection = reflect(-lightDirection, normal); " +

                "           specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess); " +
                "       } " +

                "       float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0); " +
                "       lightWeighting = uAmbientColor " +
                "           + uPointLightingSpecularColor * specularLightWeighting " +
                "           + uPointLightingDiffuseColor * diffuseLightWeighting; " +
                "   } " +

                "   vec4 fragmentColor; " +
                "   if (uUseTextures) { " +
                "       fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, 1.0 - vTextureCoord.t)); " +
                "   } else { " +
                "       fragmentColor = vec4(1.0, 1.0, 1.0, 1.0); " +
                "   } " +
                "       gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a); " +
                "}"
            ]
        }
    },

    ProgramUniform : function(context, program, name, type, size, location, logging) {
        logging.debug("Program uniform found: " + name);
        var func = null;
        if (type == context.BOOL) {
            func = function (v) {
                context.uniform1iv(location, v);
            };
        } else if (type == context.BOOL_VEC2) {
            func = function (v) {
                context.uniform2iv(location, v);
            };
        } else if (type == context.BOOL_VEC3) {
            func = function (v) {
                context.uniform3iv(location, v);
            };
        } else if (type == context.BOOL_VEC4) {
            func = function (v) {
                context.uniform4iv(location, v);
            };
        } else if (type == context.INT) {
            func = function (v) {
                context.uniform1iv(location, v);
            };
        } else if (type == context.INT_VEC2) {
            func = function (v) {
                context.uniform2iv(location, v);
            };
        } else if (type == context.INT_VEC3) {
            func = function (v) {
                context.uniform3iv(location, v);
            };
        } else if (type == context.INT_VEC4) {
            func = function (v) {
                context.uniform4iv(location, v);
            };
        } else if (type == context.FLOAT) {
            func = function (v) {
                context.uniform1fv(location, v);
            };
        } else if (type == context.FLOAT_VEC2) {
            func = function (v) {
                context.uniform2fv(location, v);
            };
        } else if (type == context.FLOAT_VEC3) {
            func = function (v) {
                context.uniform3fv(location, v);
            };
        } else if (type == context.FLOAT_VEC4) {
            func = function (v) {
                context.uniform4fv(location, v);
            };
        } else if (type == context.FLOAT_MAT2) {
            func = function (v) {
                context.uniformMatrix2fv(location, context.FALSE, v);
            };
        } else if (type == context.FLOAT_MAT3) {
            func = function (v) {
                context.uniformMatrix3fv(location, context.FALSE, v);
            };
        } else if (type == context.FLOAT_MAT4) {
            func = function (v) {
                context.uniformMatrix4fv(location, context.FALSE, v);
            };
        } else {
            throw "Unsupported shader uniform type: " + type;
        }

        this.setValue = function(v) {
            func(v);
        };

        this.getValue = function() {
            return context.getUniform(program, location);
        };
    },

    ProgramSampler : function(context, program, name, type, size, location, logging) {
        logging.debug("Program sampler found: " + name);
        this.bindTexture = function(texture) {
            texture.bind();
            context.uniform1i(location, 0);
        };
    },

    /** An attribute within a shader
     */
    ProgramAttribute : function(context, program, name, type, size, location, logging) {
        logging.debug("Program attribute found: " + name);
        this.bindFloatArrayBuffer = function(buffer) {
            context.enableVertexAttribArray(location);
            buffer.bind();
            context.vertexAttribPointer(location, buffer.itemSize, context.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
        };

    },

    /**
     * A vertex/fragment shader in a program
     *
     * @param context WebGL context
     * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
     * @param source Source code for shader
     * @param logging Shader will write logging's debug channel as it compiles
     */
    Shader : function(context, type, source, logging) {
        this.handle = context.createShader(type);

        logging.debug("Creating " + ((type == context.VERTEX_SHADER) ? "vertex" : "fragment") + " shader");
        this.valid = true;

        context.shaderSource(this.handle, source);
        context.compileShader(this.handle);

        if (context.getShaderParameter(this.handle, context.COMPILE_STATUS) != 0) {
            logging.debug("Shader compile succeeded:" + context.getShaderInfoLog(this.handle));
        }
        else {
            this.valid = false;
            logging.error("Shader compile failed:" + context.getShaderInfoLog(this.handle));
        }
        if (!this.valid) {
            if (this.valid) {
                throw new SceneJS.exceptions.ShaderCompilationFailureException("Shader program failed to compile");
            }
        }
    },


    /**
     * A program on an active WebGL context
     *
     * @param programId SceneJS-managed ID for program
     * @param lastUsed Time program was lst activated, for LRU cache eviction
     * @param context WebGL context
     * @param vertexSources Source codes for vertex shaders
     * @param fragmentSources Source codes for fragment shaders
     * @param logging Program and shaders will write to logging's debug channel as they compile and link
     */
    Program : function(type, programId, lastUsed, context, vertexSources, fragmentSources, logging) {
        this.programId = programId;
        this.lastUsed = lastUsed;

        /* Create shaders from sources
         */
        var shaders = [];
        for (var i = 0; i < vertexSources.length; i++) {
            shaders.push(new SceneJS._webgl.Shader(context, context.VERTEX_SHADER, vertexSources[i], logging));
        }
        for (var i = 0; i < fragmentSources.length; i++) {
            shaders.push(new SceneJS._webgl.Shader(context, context.FRAGMENT_SHADER, fragmentSources[i], logging));
        }

        /* Create program, attach shaders, link and validate program
         */
        var handle = context.createProgram();

        for (var i = 0; i < shaders.length; i++) {
            var shader = shaders[i];
            if (shader.valid) {
                context.attachShader(handle, shader.handle);
            }
        }
        context.linkProgram(handle);
        context.validateProgram(handle);

        this.valid = true;
        this.valid = this.valid && (context.getProgramParameter(handle, context.LINK_STATUS) != 0);
        this.valid = this.valid && (context.getProgramParameter(handle, context.VALIDATE_STATUS) != 0);

        logging.debug("Creating shader program: '" + programId + "'");
        if (this.valid) {
            logging.debug("Program link succeeded: " + context.getProgramInfoLog(handle));
        }
        else {
            logging.debug("Program link failed: " + context.getProgramInfoLog(handle));
        }

        if (!this.valid) {
            throw new SceneJS.exceptions.ShaderLinkFailureException("Shader program failed to link");
        }

        /* Discover active uniforms and samplers
         */
        var uniforms = {};
        var samplers = {};

        var numUniforms = context.getProgramParameter(handle, context.ACTIVE_UNIFORMS);

        for (var i = 0; i < numUniforms; ++i) {
            var u = context.getActiveUniform(handle, i);
            if (u) {
                var location = context.getUniformLocation(handle, u.name);
                if ((u.type == context.SAMPLER_2D) || (u.type == context.SAMPLER_CUBE) || (u.type == 35682)) {

                    samplers[u.name] = new SceneJS._webgl.ProgramSampler(
                            context,
                            handle,
                            u.name,
                            u.type,
                            u.size,
                            location,
                            logging);
                } else {

                    uniforms[u.name] = new SceneJS._webgl.ProgramUniform(
                            context,
                            handle,
                            u.name,
                            u.type,
                            u.size,
                            location,
                            logging);
                }
            }
        }

        /* Discover attributes
         */
        var attributes = {};

        var numAttribs = context.getProgramParameter(handle, context.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < numAttribs; i++) {
            var a = context.getActiveAttrib(handle, i);
            if (a) {
                var location = context.getAttribLocation(handle, a.name);
                attributes[a.name] = new SceneJS._webgl.ProgramAttribute(
                        context,
                        handle,
                        a.name,
                        a.type,
                        a.size,
                        location,
                        logging);
            }
        }

        //        var index = 0;
        //        for (var v in attributes) {
        //            var attr = attributes[v];
        //            context.bindAttribLocation(handle, index, attr.name);
        //            attr.index = index;
        //            index++;
        //        }
        //        context.linkProgram(handle); // requires relink
        //
        //        // ensure texture unit is sequential in "for (attr in obj.samplers)" loops
        //        context.useProgram(handle);
        //
        //        var unit = 0;
        //        for (var s in samplers) {
        //            var sampler = samplers[s];
        //            context.uniform1i(sampler.location, unit);
        //            unit++;
        //        }
        //        context.useProgram(null);


        this.bind = function() {
            context.useProgram(handle);
        };

        this.setUniform = function(name, value) {
            var u = uniforms[name];
            if (u) {
                u.setValue(value);
            } else {
                //    logging.warn("Shader uniform load failed - uniform not found in shader '" + type + "': " + name);
            }
        };

        this.bindFloatArrayBuffer = function(name, buffer) {
            var attr = attributes[name];
            if (attr) {
                attr.bindFloatArrayBuffer(buffer);
            } else {
                //  logging.warn("Shader attribute bind failed - attribute not found in shader '" + type + "': " + name);
            }
        };

        this.bindTexture = function(name, texture) {
            var sampler = samplers[name];
            if (sampler) {
                sampler.bindTexture(texture);
            } else {
                //  logging.warn("Sampler not found: " + name);
            }
        };

        this.unbind = function() {
            context.useProgram(null);
        };

        this.destroy = function() {
            if (this.valid) {
                logging.debug("Destroying shader program: '" + programId + "'");
                context.deleteProgram(handle);
                for (var s in shaders) {
                    context.deleteShader(shaders[s].handle);
                }
                attributes = null;
                uniforms = null;
                samplers = null;
                this.valid = false;
            }
        };
    },

    Texture2D : function(context, cfg) {
        cfg.logging.debug("Creating texture: '" + cfg.textureId + "'");
        this.textureId = cfg.textureId;
        this.handle = context.createTexture();
        this.target = context.TEXTURE_2D;
        this.minFilter = cfg.minFilter;
        this.magFilter = cfg.magFilter;
        this.wrapS = cfg.wrapS;
        this.wrapT = cfg.wrapT;

        context.bindTexture(this.target, this.handle);

        if (cfg.image) {

            /* Texture from image
             */
            context.texImage2D(context.TEXTURE_2D, 0, cfg.image, cfg.flipY);

            this.format = context.RGBA;
            this.width = cfg.image.width;
            this.height = cfg.image.height;
            this.isDepth = false;
            this.depthMode = 0;
            this.depthCompareMode = 0;
            this.depthCompareFunc = 0;

        } else {

            /* Texture from data
             */
            if (!cfg.texels) {
                if (cfg.sourceType == context.FLOAT) {
                    cfg.texels = new WebGLFloatArray(cfg.width * cfg.height * 4);
                }
                else {
                    cfg.texels = new WebGLUnsignedByteArray(cfg.width * cfg.height * 4);
                }
            }

            context.texImage2D(context.TEXTURE_2D, 0, cfg.internalFormat, cfg.width, cfg.height, 0, cfg.sourceFormat, cfg.sourceType, cfg.texels);

            if (cfg.isDepth) {
                context.texParameteri(context.TEXTURE_2D, context.DEPTH_TEXTURE_MODE, cfg.depthMode);
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_COMPARE_MODE, cfg.depthCompareMode);
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_COMPARE_FUNC, cfg.depthCompareFunc);
            }

            this.format = cfg.internalFormat;
            this.width = cfg.width;
            this.height = cfg.height;
            this.isDepth = cfg.isDepth;
            this.depthMode = cfg.depthMode;
            this.depthCompareMode = cfg.depthCompareMode;
            this.depthCompareFunc = cfg.depthCompareFunc;
        }

        context.texParameteri(// Filtered technique when scaling texture down
                context.TEXTURE_2D,
                context.TEXTURE_MIN_FILTER,
                cfg.minFilter);

        context.texParameteri(// Filtering technique when scaling texture up
                context.TEXTURE_2D,
                context.TEXTURE_MAG_FILTER,
                cfg.magFilter);

        context.texParameteri(
                context.TEXTURE_2D,
                context.TEXTURE_WRAP_S,
                cfg.wrapS);

        context.texParameteri(
                context.TEXTURE_2D,
                context.TEXTURE_WRAP_T,
                cfg.wrapT);

        /* Generate MIP map if required
         */
        if (cfg.minFilter == context.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == context.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == context.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == context.LINEAR_MIPMAP_LINEAR) {

            context.generateMipmap(context.TEXTURE_2D);
        }

        context.bindTexture(this.target, null);

        this.bind = function(unit) {
            if (unit) {
                context.activeTexture(context.TEXTURE0 + unit);
            } else {
                context.activeTexture(context.TEXTURE0);
            }
            context.bindTexture(this.target, this.handle);
        };

        this.unbind = function(unit) {
            if (unit) {
                context.activeTexture(context.TEXTURE0 + unit);
            } else {
                context.activeTexture(context.TEXTURE0);
            }
            context.bindTexture(this.target, null);
        };

        this.generateMipmap = function() {
            context.generateMipmap(context.TEXTURE_2D);
        };

        this.destroy = function() {
            if (this.handle) {
                cfg.logging.debug("Destroying texture");
                context.destroyTexture(this.handle);
                this.handle = null;
            }
        };
    },

    /** Buffer for vertices and indices
     *
     * @param context  WebGL context
     * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
     * @param values   WebGL array wrapper
     * @param numItems Count of items in array wrapper
     * @param itemSize Size of each item
     * @param usage    Eg. STATIC_DRAW
     */
    ArrayBuffer : function(context, type, values, numItems, itemSize, usage) {
        this.handle = context.createBuffer();
        context.bindBuffer(type, this.handle);
        context.bufferData(type, values, usage);
        context.bindBuffer(type, null);

        this.type = type;
        this.numItems = numItems;
        this.itemSize = itemSize;

        this.bind = function() {
            context.bindBuffer(type, this.handle);
        };

        this.unbind = function() {
            context.bindBuffer(type, null);
        };

        this.destroy = function() {
            context.deleteBuffer(this.handle);
        };
    }
};
