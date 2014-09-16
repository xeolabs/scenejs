(function() {

    /**
     * The default state core singleton for {@link SceneJS.Stage} nodes
     */
    var defaultCore = {
        type: "stage",
        stateId: SceneJS._baseStateId++,
        priority: 0,
        pickable: true,
        enabled: true
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.stage = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which assigns the {@link SceneJS.Geometry}s within its subgraph to a prioritised render bin
     * @extends SceneJS.Node
     */
    SceneJS.Stage = SceneJS_NodeFactory.createNodeType("stage");

    SceneJS.Stage.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node defines the resource
            this._core.priority = params.priority || 0;
            this._core.enabled = params.enabled !== false;
            this._core.pickable = !!params.pickable;
        }
    };

    SceneJS.Stage.prototype.setPriority = function(priority) {
        priority = priority || 0;
        if (this._core.priority != priority) {
            this._core.priority = priority;
            this._engine.display.stateOrderDirty = true;
        }
    };

    SceneJS.Stage.prototype.getPriority = function() {
        return this._core.priority;
    };

    SceneJS.Stage.prototype.setEnabled = function(enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
    };

    SceneJS.Stage.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Stage.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Stage.prototype._compile = function(ctx) {
        this._engine.display.stage = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.stage = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();

