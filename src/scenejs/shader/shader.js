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
                        SceneJS_DrawList.setShader(idStack[stackLen - 1], shaderStack[stackLen - 1]);
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setShader();
                    }
                    dirty = false;
                }
            });

    function pushShaders(id, shaders) {
        idStack[stackLen] = id;
        shaderStack[stackLen] = shaders;
        stackLen++;
        dirty = true;
    }

    function popShaders() {
        stackLen--;
        dirty = true;
    }

    var Shader = SceneJS.createNodeType("shader");

    Shader.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this._setShaders(params.shaders);
            this.setVars(params.vars);
        }
    };

    Shader.prototype._setShaders = function(shaders) {
        shaders = shaders || [];
        this.core.shaders = {};
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
            this.core.shaders[shader.stage] = {
                code: code,
                hooks: shader.hooks
            };
        }
    };

    Shader.prototype.setVars = function(vars) {
        vars = vars || {};
        SceneJS._apply(vars, this.core.vars);
    };

    Shader.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Shader.prototype._preCompile = function() {
        pushShaders(this.attr.id, { shaders: this.core.shaders, vars: this.core.vars });
    };

    Shader.prototype._postCompile = function() {
        popShaders();
    };
})();