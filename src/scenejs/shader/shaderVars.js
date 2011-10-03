new (function() {

    var idStack = [];
    var shaderVarsStack = [];
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
                        SceneJS_DrawList.setShaderVars(idStack[stackLen - 1], shaderVarsStack[stackLen - 1]);
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setShaderVars();
                    }
                    dirty = false;
                }
            });

    var ShaderVars = SceneJS.createNodeType("shaderVars");

    ShaderVars.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setVars(params.vars);
        }
    };

    ShaderVars.prototype.setVars = function(vars) {
        vars = vars || {};
        var core = this.core;
        if (!core.vars) {
            core.vars = {};
        }
        SceneJS._apply(vars, core.vars);
    };

    ShaderVars.prototype._compile = function() {

        idStack[stackLen] = this.core._coreId; // Tie draw list state to core, not to scene node
        shaderVarsStack[stackLen] = this.core.vars;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;                                 // pop vars
        dirty = true;
    };
})();