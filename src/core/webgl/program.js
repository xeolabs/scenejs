/**
 * @class Wrapper for a WebGL program
 *
 * @param hash SceneJS-managed ID for program
 * @param gl WebGL gl
 * @param vertexSources Source codes for vertex shaders
 * @param fragmentSources Source codes for fragment shaders
 * @param logging Program and shaders will write to logging's debug channel as they compile and link
 */
SceneJS._webgl.Program = function (gl, vertexSources, fragmentSources) {

    /**
     * True as soon as this program is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;

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

    // Create shaders from sources

    this._shaders = [];

    var a, i, u, u_name, location, shader;

    for (i = 0; i < vertexSources.length; i++) {
        this._shaders.push(new SceneJS._webgl.Shader(gl, gl.VERTEX_SHADER, vertexSources[i]));
    }

    for (i = 0; i < fragmentSources.length; i++) {
        this._shaders.push(new SceneJS._webgl.Shader(gl, gl.FRAGMENT_SHADER, fragmentSources[i]));
    }

    // Create program, attach shaders, link and validate program

    this.handle = gl.createProgram();

    if (this.handle) {

        for (i = 0; i < this._shaders.length; i++) {
            shader = this._shaders[i];
            if (shader.valid) {
                gl.attachShader(this.handle, shader.handle);
            }
        }

        gl.linkProgram(this.handle);
        if (!gl.getProgramParameter(this.handle, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.handle));
        }

        // Discover uniforms and samplers

        var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
        var valueIndex = 0;
        for (i = 0; i < numUniforms; ++i) {
            u = gl.getActiveUniform(this.handle, i);
            if (u) {
                u_name = u.name;
                if (u_name[u_name.length - 1] == "\u0000") {
                    u_name = u_name.substr(0, u_name.length - 1);
                }
                location = gl.getUniformLocation(this.handle, u_name);
                if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {
                    this._samplers[u_name] = new SceneJS._webgl.Sampler(gl, this.handle, u_name, u.type, u.size, location);
                } else {
                    this._uniforms[u_name] = new SceneJS._webgl.Uniform(gl, this.handle, u_name, u.type, u.size, location, valueIndex);
                    ++valueIndex;
                }
            }
        }

        // Discover attributes

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < numAttribs; i++) {
            a = gl.getActiveAttrib(this.handle, i);
            if (a) {
                location = gl.getAttribLocation(this.handle, a.name);
                this._attributes[a.name] = new SceneJS._webgl.Attribute(gl, this.handle, a.name, a.type, a.size, location);
            }
        }

        // Program allocated
        this.allocated = true;

    } // if (this.handle)
};


SceneJS._webgl.Program.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.useProgram(this.handle);
};

SceneJS._webgl.Program.prototype.getUniformLocation = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u.getLocation();
    }
};

SceneJS._webgl.Program.prototype.getUniform = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u;
    }
};

SceneJS._webgl.Program.prototype.getAttribute = function (name) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        return attr;
    }
};

SceneJS._webgl.Program.prototype.bindFloatArrayBuffer = function (name, buffer) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        attr.bindFloatArrayBuffer(buffer);
    }
};

SceneJS._webgl.Program.prototype.bindTexture = function (name, texture, unit) {
    if (!this.allocated) {
        return false;
    }
    var sampler = this._samplers[name];
    if (sampler) {
        return sampler.bindTexture(texture, unit);
    } else {
        return false;
    }
};

SceneJS._webgl.Program.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteProgram(this.handle);
    for (var s in this._shaders) {
        this.gl.deleteShader(this._shaders[s].handle);
    }
    this.handle = null;
    this._attributes = null;
    this._uniforms = null;
    this._samplers = null;
    this.allocated = false;
};


SceneJS._webgl.Program.prototype.setUniform = function (name, value) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        u.setValue(value);
    }
};
