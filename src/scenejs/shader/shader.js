SceneJS.Shader = SceneJS.createNodeType("shader");

SceneJS.Shader.prototype._init = function(params) {
    this._vars = {};
    this._setShaders(params.shaders);
    this.setVars(params.vars);
};

SceneJS.Shader.prototype._setShaders = function(shaders) {
    this._shaders = {};
    var shader;
    for (var i = 0, len = shaders.length; i < len; i++) {
        shader = shaders[i];
        if (!shader.stage) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "shader 'stage' attribute expected");
        }

        var code;
        if (shader.code) {
            if (SceneJS._isArray(shader.code)) {
                code = shader.code.join("");
            } else {
                code = shader.code;
            }
        }

        this._shaders[shader.stage] = {
            code: code,
            hooks: shader.hooks
        };
    }
};

SceneJS.Shader.prototype.setVars = function(vars) {
    vars = vars || {};
    SceneJS._apply(vars, this._vars);
};

SceneJS.Shader.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

SceneJS.Shader.prototype._preCompile = function(traversalContext) {
    SceneJS_shaderModule.pushShaders(this._attr.id, { shaders: this._shaders, vars: this._vars });
};

SceneJS.Shader.prototype._postCompile = function(traversalContext) {
    SceneJS_shaderModule.popShaders();
};