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
        this._shaders.push(new SceneJS._webgl.Shader(gl, gl.VERTEX_SHADER, vertexSources[i]));
    }
    for (i = 0; i < fragmentSources.length; i++) {
        this._shaders.push(new SceneJS._webgl.Shader(gl, gl.FRAGMENT_SHADER, fragmentSources[i]));
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

    //this.valid = (gl.getProgramParameter(handle, gl.LINK_STATUS) != 0);

    var debugCfg = SceneJS_configsModule.getConfigs("shading");
//    if (debugCfg.validate !== false) {
//        gl.validateProgram(handle);
//        this.valid = this.valid && (gl.getProgramParameter(handle, gl.VALIDATE_STATUS) != 0);
//    }

    if (false && !this.valid) {

        if (!gl.isContextLost()) { // Handled explicitly elsewhere, so wont rehandle here

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

    this.uniformValues = [];
    var valueIndex = 0;

    for (i = 0; i < numUniforms; ++i) {
        u = gl.getActiveUniform(handle, i);
        if (u) {
            u_name = u.name;
            if (u_name[u_name.length - 1] == "\u0000") {
                u_name = u_name.substr(0, u_name.length - 1);
            }
            location = gl.getUniformLocation(handle, u_name);
            if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {

                this._samplers[u_name] = new SceneJS._webgl.Sampler(
                    gl,
                    handle,
                    u_name,
                    u.type,
                    u.size,
                    location);
            } else {
                this._uniforms[u_name] = new SceneJS._webgl.Uniform(
                    gl,
                    handle,
                    u_name,
                    u.type,
                    u.size,
                    location,
                    valueIndex);
                this.uniformValues[valueIndex] = null;
                ++valueIndex;
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
            this._attributes[a.name] = new SceneJS._webgl.Attribute(
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

SceneJS._webgl.Program.prototype.setUniform = function (name, value) {
    var u = this._uniforms[name];
    if (u) {
        if (this.uniformValues[u.index] !== value || !u.numberValue) {
            u.setValue(value);
            if (this._profile) {
                this._profile.uniform++;
            }
            this.uniformValues[u.index] = value;
        }
    } else {
        //      SceneJS.log.warn("Shader uniform load failed - uniform not found in shader : " + name);
    }
};
