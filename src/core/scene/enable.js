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
            if (params.enable) {
                this.setEnabled(params.enable);
            }
        }
    };

    SceneJS.Enable.prototype.setEnabled = function (enable) {
        this._core.enabled = !!enable;
        this._engine.display.drawListDirty = true;
        return this;
    };

    SceneJS.Enable.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Enable.prototype._compile = function () {
        this._engine.display.enable = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.enable = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();