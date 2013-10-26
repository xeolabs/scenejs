(function () {

    // The default state core singleton for {@link SceneJS.Enable} nodes
    var defaultCore = {
        stateId:SceneJS._baseStateId++,
        type:"enable",
        enabled:true
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.enable = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which enables or disables rendering for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Enable = SceneJS_NodeFactory.createNodeType("enable");

    SceneJS.Enable.prototype._init = function (params) {
        if (this._core.useCount == 1) {   // This node is first to reference the state core, so sets it up
            this._core.enabled = true;
            if (params.enabled != undefined) {
                this.setEnabled(params.enabled);
            }
        }
    };

    SceneJS.Enable.prototype.setEnabled = function (enabled) {
        if (enabled !== this._core.enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
            this.publish("enabled", enabled);
        }
        return this;
    };

    SceneJS.Enable.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Enable.prototype._compile = function (ctx) {
        this._engine.display.enable = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.enable = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();