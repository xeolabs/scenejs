new (function() {

    /**
     * The default state core singleton for {@link SceneJS.ShaderParams} nodes
     */
    var defaultCore = {
        type: "shaderParams",
        stateId: SceneJS._baseStateId++,
        empty: true
    };

    var idStack = [];
    var shaderParamsStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {

                params.engine.display.shaderParams = defaultCore;

                stackLen = 0;
                dirty = true;
            });

    SceneJS_events.addListener(
            SceneJS_events.OBJECT_COMPILING,
            function(params) {
                if (dirty) {

                    if (stackLen > 0) {
                        var core = {
                            type: "shaderParams",
                            stateId: idStack[stackLen - 1],
                            paramsStack: shaderParamsStack.slice(0, stackLen)
                        };
                        params.display.shaderParams = core;

                    } else {
                        params.display.shaderParams = defaultCore;
                    }

                    dirty = false;
                }
            });

    SceneJS.ShaderParams = SceneJS_NodeFactory.createNodeType("shaderParams");

    SceneJS.ShaderParams.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node is the resource definer
            this.setParams(params.params);
        }
    };

    SceneJS.ShaderParams.prototype.setParams = function(params) {
        params = params || {};
        var core = this._core;
        if (!core.params) {
            core.params = {};
        }
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                core.params[name] = params[name];
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.ShaderParams.prototype.getParams = function() {
        var coreParams = this._core.params;
        if (!coreParams) {
            return {};
        }
        var params = {};
        for (var name in coreParams) {
            if (coreParams.hasOwnProperty(name)) {
                params[name] = coreParams[name];
            }
        }
        return params;
    };

    SceneJS.ShaderParams.prototype._compile = function() {

        idStack[stackLen] = this._core.coreId; // Tie draw list state to core, not to scene node
        shaderParamsStack[stackLen] = this._core.params;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };

})();