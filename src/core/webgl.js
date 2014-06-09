/** Maps SceneJS node parameter names to WebGL enum names
 * @private
 */
var SceneJS_webgl_enumMap = {
    funcAdd:"FUNC_ADD",
    funcSubtract:"FUNC_SUBTRACT",
    funcReverseSubtract:"FUNC_REVERSE_SUBTRACT",
    zero:"ZERO",
    one:"ONE",
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
    front:"FRONT",
    back:"BACK",
    frontAndBack:"FRONT_AND_BACK",
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
    linear:"LINEAR",
    nearest:"NEAREST",
    linearMipMapNearest:"LINEAR_MIPMAP_NEAREST",
    nearestMipMapNearest:"NEAREST_MIPMAP_NEAREST",
    nearestMipMapLinear:"NEAREST_MIPMAP_LINEAR",
    linearMipMapLinear:"LINEAR_MIPMAP_LINEAR",
    repeat:"REPEAT",
    clampToEdge:"CLAMP_TO_EDGE",
    mirroredRepeat:"MIRRORED_REPEAT",
    alpha:"ALPHA",
    rgb:"RGB",
    rgba:"RGBA",
    luminance:"LUMINANCE",
    luminanceAlpha:"LUMINANCE_ALPHA",
    textureBinding2D:"TEXTURE_BINDING_2D",
    textureBindingCubeMap:"TEXTURE_BINDING_CUBE_MAP",
    compareRToTexture:"COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
    unsignedByte:"UNSIGNED_BYTE"
};

var SceneJS_webgl_ProgramUniform = function (gl, program, name, type, size, location, logging) {

    var func = null;
    if (type == gl.BOOL) {
        func = function (v) {
            gl.uniform1i(location, v);
        };
    } else if (type == gl.BOOL_VEC2) {
        func = function (v) {
            gl.uniform2iv(location, v);
        };
    } else if (type == gl.BOOL_VEC3) {
        func = function (v) {
            gl.uniform3iv(location, v);
        };
    } else if (type == gl.BOOL_VEC4) {
        func = function (v) {
            gl.uniform4iv(location, v);
        };
    } else if (type == gl.INT) {
        func = function (v) {
            gl.uniform1iv(location, v);
        };
    } else if (type == gl.INT_VEC2) {
        func = function (v) {
            gl.uniform2iv(location, v);
        };
    } else if (type == gl.INT_VEC3) {
        func = function (v) {
            gl.uniform3iv(location, v);
        };
    } else if (type == gl.INT_VEC4) {
        func = function (v) {
            gl.uniform4iv(location, v);
        };
    } else if (type == gl.FLOAT) {
        func = function (v) {
            gl.uniform1f(location, v);
        };
    } else if (type == gl.FLOAT_VEC2) {
        func = function (v) {
            gl.uniform2fv(location, v);
        };
    } else if (type == gl.FLOAT_VEC3) {
        func = function (v) {
            gl.uniform3fv(location, v);
        };
    } else if (type == gl.FLOAT_VEC4) {
        func = function (v) {
            gl.uniform4fv(location, v);
        };
    } else if (type == gl.FLOAT_MAT2) {
        func = function (v) {
            gl.uniformMatrix2fv(location, gl.FALSE, v);
        };
    } else if (type == gl.FLOAT_MAT3) {
        func = function (v) {
            gl.uniformMatrix3fv(location, gl.FALSE, v);
        };
    } else if (type == gl.FLOAT_MAT4) {
        func = function (v) {
            gl.uniformMatrix4fv(location, gl.FALSE, v);
        };
    } else {
        throw "Unsupported shader uniform type: " + type;
    }

    this.setValue = func;


    this.getValue = function () {
        return gl.getUniform(program, location);
    };

    this.getLocation = function () {
        return location;
    };
};

var SceneJS_webgl_ProgramSampler = function (gl, program, name, type, size, location) {
    this.bindTexture = function (texture, unit) {
        if (texture.bind(unit)) {
            gl.uniform1i(location, unit);
            return true;
        }
        return false;
    };
};

/** An attribute within a shader
 */
var SceneJS_webgl_ProgramAttribute = function (gl, program, name, type, size, location) {
    this.bindFloatArrayBuffer = function (buffer) {
        if (buffer) {
            buffer.bind();
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
        }
    };

};

/**
 * A vertex/fragment shader in a program
 *
 * @private
 * @param gl WebGL gl
 * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @param source Source code for shader
 * @param logging Shader will write logging's debug channel as it compiles
 */
var SceneJS_webgl_Shader = function (gl, type, source) {

    this.handle = gl.createShader(type);

    gl.shaderSource(this.handle, source);
    gl.compileShader(this.handle);

    this.valid = (gl.getShaderParameter(this.handle, gl.COMPILE_STATUS) != 0);

    if (!this.valid) {

        if (!gl.isContextLost()) { // Handled explicitely elsewhere, so wont rehandle here

            SceneJS.log.error("Shader program failed to compile: " + gl.getShaderInfoLog(this.handle));
            SceneJS.log.error("Shader source:");
            var lines = source.split('\n');
            for (var j = 0; j < lines.length; j++) {
                SceneJS.log.error(lines[j]);
            }

            throw SceneJS_error.fatalError(
                SceneJS.errors.SHADER_COMPILATION_FAILURE, "Shader program failed to compile");
        }
    }
};

/**
 * @class Wrapper for a WebGL program
 *
 * @param hash SceneJS-managed ID for program
 * @param gl WebGL gl
 * @param vertexSources Source codes for vertex shaders
 * @param fragmentSources Source codes for fragment shaders
 * @param logging Program and shaders will write to logging's debug channel as they compile and link
 */
var SceneJS_webgl_Program = function (gl, vertexSources, fragmentSources) {

    var a, i, u, u_name, location, shader;

    this._uniforms = {};
    this._samplers = {};
    this._attributes = {};

    this.materialSettings = {
        specularColor: [0, 0, 0],
        specular: 0,
        shine: 0,
        emit: 0,
        alpha: 0
    };

    /* Create shaders from sources
     */
    this._shaders = [];
    for (i = 0; i < vertexSources.length; i++) {
        this._shaders.push(new SceneJS_webgl_Shader(gl, gl.VERTEX_SHADER, vertexSources[i]));
    }
    for (i = 0; i < fragmentSources.length; i++) {
        this._shaders.push(new SceneJS_webgl_Shader(gl, gl.FRAGMENT_SHADER, fragmentSources[i]));
    }

    /* Create program, attach shaders, link and validate program
     */
    var handle = gl.createProgram();

    for (i = 0; i < this._shaders.length; i++) {
        shader = this._shaders[i];
        if (shader.valid) {
            gl.attachShader(handle, shader.handle);
        }
    }
    gl.linkProgram(handle);

    this.valid = (gl.getProgramParameter(handle, gl.LINK_STATUS) != 0);

    var debugCfg = SceneJS_configsModule.getConfigs("shading");
    if (debugCfg.validate !== false) {
        gl.validateProgram(handle);
        this.valid = this.valid && (gl.getProgramParameter(handle, gl.VALIDATE_STATUS) != 0);
    }

    if (!this.valid) {

        if (!gl.isContextLost()) { // Handled explicitely elsewhere, so wont rehandle here

            SceneJS.log.error("Shader program failed to link: " + gl.getProgramInfoLog(handle));

            SceneJS.log.error("Vertex shader(s):");
            for (i = 0; i < vertexSources.length; i++) {
                SceneJS.log.error("Vertex shader #" + i + ":");
                var lines = vertexSources[i].split('\n');
                for (var j = 0; j < lines.length; j++) {
                    SceneJS.log.error(lines[j]);

                }
            }

            SceneJS.log.error("Fragment shader(s):");
            for (i = 0; i < fragmentSources.length; i++) {
                SceneJS.log.error("Fragment shader #" + i + ":");
                var lines = fragmentSources[i].split('\n');
                for (var j = 0; j < lines.length; j++) {
                    SceneJS.log.error(lines[j]);
                }
            }

            throw SceneJS_error.fatalError(
                SceneJS.errors.SHADER_LINK_FAILURE, "Shader program failed to link");
        }
    }

    /* Discover active uniforms and samplers
     */

    var numUniforms = gl.getProgramParameter(handle, gl.ACTIVE_UNIFORMS);

    for (i = 0; i < numUniforms; ++i) {
        u = gl.getActiveUniform(handle, i);
        if (u) {
            u_name = u.name;
            if (u_name[u_name.length - 1] == "\u0000") {
                u_name = u_name.substr(0, u_name.length - 1);
            }
            location = gl.getUniformLocation(handle, u_name);
            if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {

                this._samplers[u_name] = new SceneJS_webgl_ProgramSampler(
                    gl,
                    handle,
                    u_name,
                    u.type,
                    u.size,
                    location);
            } else {
                this._uniforms[u_name] = new SceneJS_webgl_ProgramUniform(
                    gl,
                    handle,
                    u_name,
                    u.type,
                    u.size,
                    location);
            }
        }
    }

    /* Discover attributes
     */

    var numAttribs = gl.getProgramParameter(handle, gl.ACTIVE_ATTRIBUTES);
    for (i = 0; i < numAttribs; i++) {
        a = gl.getActiveAttrib(handle, i);
        if (a) {
            location = gl.getAttribLocation(handle, a.name);
            this._attributes[a.name] = new SceneJS_webgl_ProgramAttribute(
                gl,
                handle,
                a.name,
                a.type,
                a.size,
                location);
        }
    }

    this.setProfile = function (profile) {
        this._profile = profile;
    };

    this.bind = function () {
        gl.useProgram(handle);
        if (this._profile) {
            this._profile.program++;
        }
    };

    this.getUniformLocation = function (name) {
        var u = this._uniforms[name];
        if (u) {
            return u.getLocation();
        } else {
            // SceneJS.log.warn("Uniform not found in shader : " + name);
        }
    };

    this.getUniform = function (name) {
        var u = this._uniforms[name];
        if (u) {
            return u;
        } else {
            //      SceneJS.log.warn("Shader uniform load failed - uniform not found in shader : " + name);
        }
    };

    this.setUniform = function (name, value) {
        var u = this._uniforms[name];
        if (u) {
            u.setValue(value);
            if (this._profile) {
                this._profile.uniform++;
            }
        } else {
            //      SceneJS.log.warn("Shader uniform load failed - uniform not found in shader : " + name);
        }
    };

    this.getAttribute = function (name) {
        var attr = this._attributes[name];
        if (attr) {
            return attr;
        } else {
            //  logging.warn("Shader attribute bind failed - attribute not found in shader : " + name);
        }
    };

    this.bindFloatArrayBuffer = function (name, buffer) {
        var attr = this._attributes[name];
        if (attr) {
            attr.bindFloatArrayBuffer(buffer);
            if (this._profile) {
                this._profile.varying++;
            }
        } else {
            //  logging.warn("Shader attribute bind failed - attribute not found in shader : " + name);
        }
    };

    this.bindTexture = function (name, texture, unit) {
        var sampler = this._samplers[name];
        if (sampler) {
            if (this._profile) {
                this._profile.texture++;
            }
            return sampler.bindTexture(texture, unit);
        } else {
            return false;
        }
    };

    this.destroy = function () {

        if (this.valid) {

            //   SceneJS.log.debug("Destroying shader program: '" + hash + "'");
            gl.deleteProgram(handle);
            for (var s in this._shaders) {
                gl.deleteShader(this._shaders[s].handle);
            }
            this._attributes = null;
            this._uniforms = null;
            this._samplers = null;
            this.valid = false;
        }
    };
};

var SceneJS_webgl_Texture2D = function (gl, cfg) {

    this.target = gl.TEXTURE_2D;
    this.minFilter = cfg.minFilter;
    this.magFilter = cfg.magFilter;
    this.wrapS = cfg.wrapS;
    this.wrapT = cfg.wrapT;
    this.update = cfg.update;  // For dynamically-sourcing textures (ie movies etc)
    this.texture = cfg.texture;
    this.format = gl.RGBA;
    this.isDepth = false;
    this.depthMode = 0;
    this.depthCompareMode = 0;
    this.depthCompareFunc = 0;

    try {
        gl.bindTexture(this.target, this.texture);

        if (cfg.minFilter) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, cfg.minFilter);
        }

        if (cfg.magFilter) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, cfg.magFilter);
        }

        if (cfg.wrapS) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, cfg.wrapS);
        }

        if (cfg.wrapT) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, cfg.wrapT);
        }

        if (cfg.minFilter == gl.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == gl.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == gl.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == gl.LINEAR_MIPMAP_LINEAR) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        gl.bindTexture(this.target, null);

    } catch (e) {
        throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Failed to create texture: " + e.message || e);
    }

    this.bind = function (unit) {
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, this.texture);
            if (this.update) {
                this.update(gl);
            }
            return true;
        }
        return false;
    };

    this.unbind = function (unit) {
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, null);
        }
    };

    this.destroy = function () {
        if (this.texture) {
            gl.deleteTexture(this.texture);
            this.texture = null;
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
 * @param gl  WebGL gl
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */

var SceneJS_webgl_ArrayBuffer = function (gl, type, values, numItems, itemSize, usage) {


    this.type = type;
    this.itemSize = itemSize;

    this._allocate = function (values, numItems) {
        this.handle = gl.createBuffer();
        this.handle.numItems = numItems;
        this.handle.itemSize = itemSize;
        gl.bindBuffer(type, this.handle);
        gl.bufferData(type, values, usage);
        this.handle.numItems = numItems;
        gl.bindBuffer(type, null);
        this.numItems = numItems;
        this.length = values.length;
    };

    this._allocate(values, numItems);

    this.bind = function () {
        gl.bindBuffer(type, this.handle);
    };

    this.setData = function (data, offset) {

        if (data.length > this.length) {
            this.destroy();
            this._allocate(data, data.length);

        } else {

            if (offset || offset === 0) {
                gl.bufferSubData(type, offset, data);
            } else {
                gl.bufferData(type, data);
            }
        }
    };

    this.unbind = function () {
        gl.bindBuffer(type, null);
    };

    this.destroy = function () {
        gl.deleteBuffer(this.handle);
    };
};


var SceneJS_PickBuffer = function (cfg) {

    var canvas = cfg.canvas;
    var gl = canvas.gl;

    var pickBuf;
    var bound = false;

    /**
     * Called when WebGL context restored
     */
    this.webglRestored = function (_gl) {
        gl = _gl;
        pickBuf = null;
    };

    this._touch = function () {

        var width = canvas.canvas.width;
        var height = canvas.canvas.height;

        if (pickBuf) { // Currently have a pick buffer
            if (pickBuf.width == width && pickBuf.height == height) { // Canvas size unchanged, buffer still good
                return;
            } else { // Buffer needs reallocation for new canvas size

                gl.deleteTexture(pickBuf.texture);
                gl.deleteFramebuffer(pickBuf.framebuf);
                gl.deleteRenderbuffer(pickBuf.renderbuf);
            }
        }

        pickBuf = {
            framebuf:gl.createFramebuffer(),
            renderbuf:gl.createRenderbuffer(),
            texture:gl.createTexture(),
            width:width,
            height:height
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.framebuf);

        gl.bindTexture(gl.TEXTURE_2D, pickBuf.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        try {
            // Do it the way the spec requires
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, textureStorage);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, pickBuf.renderbuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickBuf.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickBuf.renderbuf);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /* Verify framebuffer is OK
         */
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.framebuf);
        if (!gl.isFramebuffer(pickBuf.framebuf)) {
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Invalid framebuffer");
        }
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: " + status);
        }

        bound = false;
    };

    this.bind = function () {

        this._touch();

        if (bound) {
            return;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.framebuf);

        bound = true;
    };

    this.clear = function () {

        if (!bound) {
            throw "Pick buffer not bound";
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);
    };


    /** Reads pick buffer pixel at given coordinates, returns index of associated object else (-1)
     */
    this.read = function (pickX, pickY) {
        var x = pickX;
        var y = canvas.canvas.height - pickY;
        var pix = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix);
        return pix;
    };

    this.unbind = function () {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        bound = false;
    };
};

var SceneJS_PickBufferOLD = function (cfg) {

    var canvas = cfg.canvas;
    var gl = cfg.canvas.gl;

    var pickBuf;
    this.bound = false;

    /**
     * Initialises the pick buffer
     * @param _gl WebGL context
     */
    this.init = function (_gl) {

        gl = _gl;
        pickBuf = null;

        var width = canvas.canvas.width;
        var height = canvas.canvas.height;

        if (pickBuf) { // Currently have a pick buffer

            if (pickBuf.width == width && pickBuf.height == height) { // Canvas size unchanged, buffer still good
                return;

            } else { // Buffer needs reallocation for new canvas size

                gl.deleteTexture(pickBuf.texture);
                gl.deleteFramebuffer(pickBuf.framebuf);
                gl.deleteRenderbuffer(pickBuf.renderbuf);
            }
        }

        pickBuf = {
            framebuf:gl.createFramebuffer(),
            renderbuf:gl.createRenderbuffer(),
            texture:gl.createTexture(),
            width:width,
            height:height
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.framebuf);

        gl.bindTexture(gl.TEXTURE_2D, pickBuf.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        try {
            // Do it the way the spec requires
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, textureStorage);
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, pickBuf.renderbuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickBuf.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickBuf.renderbuf);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /* Verify framebuffer is OK
         */
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.framebuf);
        if (!gl.isFramebuffer(pickBuf.framebuf)) {
            throw  SceneJS_error.fatalError("Invalid framebuffer");
        }

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw  SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw  SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw  SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw  SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw  SceneJS_error.fatalError("Incomplete framebuffer: " + status);
        }

        this.bound = false;
    };

    this.bind = function () {
        if (this.bound) {
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.framebuf);
        this.bound = true;
    };

    this.clear = function () {
        if (this.bound) {
            return;
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);
    };


    /** Reads pick buffer pixel at given coordinates, returns index of associated object else (-1)
     */
    this.read = function (pickX, pickY) {
        var x = pickX;
        var y = canvas.canvas.height - pickY;
        var pix = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix);
        return pix;
    };

    this.unbind = function () {
        if (this.bound) {
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.bound = false;
    };

    this.init(cfg.canvas.gl);
};
