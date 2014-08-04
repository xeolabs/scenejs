(function() {

    /**
     * The default state core singleton for {@link SceneJS.Pass} nodes
     */
    var defaultCore = {
        type: "pass",
        stateId: SceneJS._baseStateId++,
        priority: 0,
        enabled: true
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.pass = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which assigns the {@link SceneJS.Geometry}s within its subgraph to a prioritised render bin
     * @extends SceneJS.Node
     */
    SceneJS.Pass = SceneJS_NodeFactory.createNodeType("pass");

    SceneJS.Pass.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node defines the resource
            this._core.priority = params.priority || 0;
            this._core.enabled = params.enabled !== false;
        }
    };

    SceneJS.Pass.prototype.setPriority = function(priority) {
        priority = priority || 0;
        if (this._core.priority != priority) {
            this._core.priority = priority;
            this._engine.display.stateOrderDirty = true;
        }
    };

    SceneJS.Pass.prototype.getPriority = function() {
        return this._core.priority;
    };

    SceneJS.Pass.prototype.setEnabled = function(enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
    };

    SceneJS.Pass.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Pass.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Pass.prototype.setClearDepth = function(clearDepth) {
        clearDepth = clearDepth || 0;
        if (this._core.clearDepth != clearDepth) {
            this._core.clearDepth = clearDepth;
            this._engine.display.drawListDirty = true;
        }
    };

    SceneJS.Pass.prototype.getClearDepth = function() {
        return this._core.clearDepth;
    };

    SceneJS.Pass.prototype._compile = function(ctx) {
        this._engine.display.pass = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.pass = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();

