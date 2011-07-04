new (function() {

    var idStack = [];
    var shaderStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setShader(idStack[stackLen - 1], shaderStack[stackLen - 1]);
                    } else  {
                        SceneJS_renderModule.setShader();
                    }
                    dirty = false;
                }
            });

    function pushShaders(id, shaders) {
        idStack[stackLen] = id;
        shaderStack[stackLen] = shaders;
        stackLen++;
        dirty = true;
    };

    function popShaders() {
        stackLen--;
        dirty = true;
    };

    var Shader = SceneJS.createNodeType("shader");

    Shader.prototype._init = function(params) {
        this._vars = {};
        this._setShaders(params.shaders);
        this.setVars(params.vars);
    };

    Shader.prototype._setShaders = function(shaders) {
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

    Shader.prototype.setVars = function(vars) {
        vars = vars || {};
        SceneJS._apply(vars, this._vars);
    };

    Shader.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Shader.prototype._preCompile = function(traversalContext) {
        pushShaders(this.attr.id, { shaders: this._shaders, vars: this._vars });
    };

    Shader.prototype._postCompile = function(traversalContext) {
        popShaders();
    };
})();