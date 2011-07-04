/** Private WebGL support classes
 */



/** Maps SceneJS node parameter names to WebGL enum names
 * @private
 */
var SceneJS_webgl_enumMap = {
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
    compareRToTexture:"COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
    unsignedByte: "UNSIGNED_BYTE"
};

/** @private
 */
var SceneJS_webgl_fogModes = {
    EXP: 0,
    EXP2: 1,
    LINEAR: 2
};

/** @private */
var SceneJS_webgl_ProgramUniform = function(context, program, name, type, size, location, logging) {

    var func = null;
    if (type == context.BOOL) {
        func = function (v) {
            context.uniform1i(location, v);
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
            context.uniform1f(location, v);
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

    /** @private */
    this.setValue = function(v) {
        func(v);
    };

    /** @private */
    this.getValue = function() {
        return context.getUniform(program, location);
    };

    this.getLocation = function() {
        return location;
    };
}

/** @private */
var SceneJS_webgl_ProgramSampler = function(context, program, name, type, size, location, logging) {
    this.bindTexture = function(texture, unit) {
        if (texture.bind(unit)) {
            context.uniform1i(location, unit);
            return true;
        }
        return false;
    };
}

/** An attribute within a shader
 * @private
 */
var SceneJS_webgl_ProgramAttribute = function(context, program, name, type, size, location, logging) {
    // logging.debug("Program attribute found in shader: " + name);
    this.bindFloatArrayBuffer = function(buffer) {
        buffer.bind();
        context.enableVertexAttribArray(location);

        context.vertexAttribPointer(location, buffer.itemSize, context.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
    };

}

/**
 * A vertex/fragment shader in a program
 *
 * @private
 * @param context WebGL context
 * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @param source Source code for shader
 * @param logging Shader will write logging's debug channel as it compiles
 */
var SceneJS_webgl_Shader = function(context, type, source, logging) {
    this.handle = context.createShader(type);

    //  logging.debug("Creating " + ((type == context.VERTEX_SHADER) ? "vertex" : "fragment") + " shader");
    this.valid = true;

    context.shaderSource(this.handle, source);
    context.compileShader(this.handle);

    if (context.getShaderParameter(this.handle, context.COMPILE_STATUS) != 0) {
        //    logging.debug("Shader compile succeeded:" + context.getShaderInfoLog(this.handle));
    }
    else {
        this.valid = false;
        logging.error("Shader compile failed:" + context.getShaderInfoLog(this.handle));
    }
    if (!this.valid) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.SHADER_COMPILATION_FAILURE, "Shader program failed to compile");
    }
}


/**
 * A program on an active WebGL context
 *
 * @private
 * @param hash SceneJS-managed ID for program
 * @param context WebGL context
 * @param vertexSources Source codes for vertex shaders
 * @param fragmentSources Source codes for fragment shaders
 * @param logging Program and shaders will write to logging's debug channel as they compile and link
 */
var SceneJS_webgl_Program = function(hash, context, vertexSources, fragmentSources, logging) {
    this.hash = hash;

    /* Create shaders from sources
     */
    var shaders = [];
    for (var i = 0; i < vertexSources.length; i++) {
        shaders.push(new SceneJS_webgl_Shader(context, context.VERTEX_SHADER, vertexSources[i], logging));
    }
    for (var i = 0; i < fragmentSources.length; i++) {
        shaders.push(new SceneJS_webgl_Shader(context, context.FRAGMENT_SHADER, fragmentSources[i], logging));
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

    this.valid = true;

    this.valid = this.valid && (context.getProgramParameter(handle, context.LINK_STATUS) != 0);

    var debugCfg = SceneJS_debugModule.getConfigs("shading");
    if (debugCfg.validate !== false) {
        context.validateProgram(handle);

        this.valid = this.valid && (context.getProgramParameter(handle, context.VALIDATE_STATUS) != 0);
    }

    if (!this.valid) {
        logging.debug("Program link failed: " + context.getProgramInfoLog(handle));
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.SHADER_LINK_FAILURE, "Shader program failed to link");
    }

    /* Discover active uniforms and samplers
     */
    var uniforms = {};
    var samplers = {};

    var numUniforms = context.getProgramParameter(handle, context.ACTIVE_UNIFORMS);

    /* Patch for http://code.google.com/p/chromium/issues/detail?id=40175)  where
     * gl.getActiveUniform was producing uniform names that had a trailing NUL in Chrome 6.0.466.0 dev
     * Issue ticket at: https://xeolabs.lighthouseapp.com/projects/50643/tickets/124-076-live-examples-blank-canvas-in-chrome-5037599
     */
    for (var i = 0; i < numUniforms; ++i) {
        var u = context.getActiveUniform(handle, i);
        if (u) {
            var u_name = u.name;
            if (u_name[u_name.length - 1] == "\u0000") {
                u_name = u_name.substr(0, u_name.length - 1);
            }
            var location = context.getUniformLocation(handle, u_name);
            if ((u.type == context.SAMPLER_2D) || (u.type == context.SAMPLER_CUBE) || (u.type == 35682)) {

                samplers[u_name] = new SceneJS_webgl_ProgramSampler(
                        context,
                        handle,
                        u_name,
                        u.type,
                        u.size,
                        location,
                        logging);
            } else {
                uniforms[u_name] = new SceneJS_webgl_ProgramUniform(
                        context,
                        handle,
                        u_name,
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
            attributes[a.name] = new SceneJS_webgl_ProgramAttribute(
                    context,
                    handle,
                    a.name,
                    a.type,
                    a.size,
                    location,
                    logging);
        }
    }

    this.setProfile = function(profile) {
        this._profile = profile;
    };

    this.bind = function() {
        context.useProgram(handle);
        if (this._profile) {
            this._profile.program++;
        }
    };

    this.setUniform = function(name, value) {
        var u = uniforms[name];
        if (u) {
            u.setValue(value);
            if (this._profile) {
                this._profile.uniform++;
            }
        } else {
            //      SceneJS_loggingModule.warn("Shader uniform load failed - uniform not found in shader : " + name);
        }
    };

    this.bindFloatArrayBuffer = function(name, buffer) {
        var attr = attributes[name];
        if (attr) {
            attr.bindFloatArrayBuffer(buffer);
            if (this._profile) {
                this._profile.varying++;
            }
        } else {
            //  logging.warn("Shader attribute bind failed - attribute not found in shader : " + name);
        }
    };

    this.bindTexture = function(name, texture, unit) {
        var sampler = samplers[name];
        if (sampler) {
            if (this._profile) {
                this._profile.texture++;
            }
            return sampler.bindTexture(texture, unit);
        } else {
            return false;
        }
    };

    this.unbind = function() {
        //     context.useProgram(0);
    };

    this.destroy = function() {
        if (this.valid) {
            //   logging.debug("Destroying shader program: '" + hash + "'");
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
}


var SceneJS_webgl_Texture2D = function(context, cfg, onComplete) {

    this._init = function(image) {
        image = SceneJS_webgl_ensureImageSizePowerOfTwo(image);
        this.canvas = cfg.canvas;
        this.textureId = cfg.textureId;
        this.handle = context.createTexture();
        this.target = context.TEXTURE_2D;
        this.minFilter = cfg.minFilter;
        this.magFilter = cfg.magFilter;
        this.wrapS = cfg.wrapS;
        this.wrapT = cfg.wrapT;
        this.update = cfg.update;  // For dynamically-sourcing textures (ie movies etc)
        context.bindTexture(this.target, this.handle);
        try {
            context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image); // New API change
        } catch (e) {
            //            context.texImage2D(context.TEXTURE_2D, 0, image, cfg.flipY); // Fallback for old browser
            context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image, null);
        }
        this.format = context.RGBA;
        this.width = image.width;
        this.height = image.height;
        this.isDepth = false;
        this.depthMode = 0;
        this.depthCompareMode = 0;
        this.depthCompareFunc = 0;
        if (cfg.minFilter) {
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, cfg.minFilter);
        }
        if (cfg.magFilter) {
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, cfg.magFilter);
        }
        if (cfg.wrapS) {
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, cfg.wrapS);
        }
        if (cfg.wrapT) {
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, cfg.wrapT);
        }
        if (cfg.minFilter == context.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == context.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == context.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == context.LINEAR_MIPMAP_LINEAR) {
            context.generateMipmap(context.TEXTURE_2D);
        }
        context.bindTexture(this.target, null);
        if (onComplete) {
            onComplete(this);
        }
    };

    if (cfg.image) {
        this._init(cfg.image);
    } else {
        if (!cfg.url) {
            throw "texture 'image' or 'url' expected";
        }
        var self = this;
        var img = new Image();
        img.onload = function() {
            self._init(img);
        };
        img.src = cfg.url;
    }

    this.bind = function(unit) {
        if (this.handle) {
            context.activeTexture(context["TEXTURE" + unit]);
            context.bindTexture(this.target, this.handle);
            if (this.update) {
                this.update(context);
            }
            return true;
        }
        return false;
    };

    this.unbind = function(unit) {
        if (this.handle) {
            context.activeTexture(context["TEXTURE" + unit]);
            context.bindTexture(this.target, null);
        }
    };

    this.generateMipmap = function() {
        if (this.handle) {
            context.generateMipmap(context.TEXTURE_2D);
        }
    };

    this.destroy = function() {
        if (this.handle) {
            context.deleteTexture(this.handle);
            this.handle = null;
        }
    };
};

function SceneJS_webgl_ensureImageSizePowerOfTwo(image) {
    if (!SceneJS_webgl_isPowerOfTwo(image.width) || !SceneJS_webgl_isPowerOfTwo(image.height)) {
        var canvas = document.createElement("canvas");
        canvas.width = SceneJS_webgl_nextHighestPowerOfTwo(image.width);
        canvas.height = SceneJS_webgl_nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
}

function SceneJS_webgl_isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
}

function SceneJS_webgl_nextHighestPowerOfTwo(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}

/** Buffer for vertices and indices
 *
 * @private
 * @param context  WebGL context
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */

var SceneJS_webgl_ArrayBuffer;
(function() {
    var bufMap = new SceneJS_Map();
    SceneJS_webgl_ArrayBuffer = function(context, type, values, numItems, itemSize, usage) {
        this.handle = context.createBuffer();
        this.id = bufMap.addItem(this);
        context.bindBuffer(type, this.handle);
        context.bufferData(type, values, usage);
        this.handle.numItems = numItems;
        this.handle.itemSize = itemSize;
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
            bufMap.removeItem(this.id);
        };
    };
})();


var SceneJS_webgl_VertexBuffer;
(function() {
    var bufMap = new SceneJS_Map();
    SceneJS_webgl_VertexBuffer = function(context, values) {
        this.handle = context.createBuffer();
        this.id = bufMap.addItem(this);
        context.bindBuffer(context.ARRAY_BUFFER, this.handle);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(values), context.STATIC_DRAW);
        context.bindBuffer(context.ARRAY_BUFFER, null);

        this.bind = function() {
            context.bindBuffer(context.ARRAY_BUFFER, this.handle);
        };

        this.unbind = function() {
            context.bindBuffer(context.ARRAY_BUFFER, null);
        };

        this.destroy = function() {
            context.deleteBuffer(this.handle);
            bufMap.removeItem(this.id);
        };
    };
})();


