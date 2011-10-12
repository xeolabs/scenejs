new (function() {

    var idStack = [];
    var shaderParamsStack = [];
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
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setShaderParams(idStack[stackLen - 1], shaderParamsStack.slice(0, stackLen));
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setShaderParams();
                    }
                    dirty = false;
                }
            });

    var ShaderParams = SceneJS.createNodeType("shaderParams");

    ShaderParams.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setParams(params.params);
        }
    };

    ShaderParams.prototype.setParams = function(params) {
        params = params || {};
        var core = this.core;
        if (!core.params) {
            core.params = {};
        }
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                core.params[name] = params[name];
            }
        }
    };

    ShaderParams.prototype._compile = function() {

        idStack[stackLen] = this.core._coreId; // Tie draw list state to core, not to scene node
        shaderParamsStack[stackLen] = this.core.params;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;                                 // pop params
        dirty = true;
    };
})();