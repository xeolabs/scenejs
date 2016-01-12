/**
 * @class Scene graph node which defines a billboard transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Billboard} nodes
    var defaultCore = {
        type: "billboard",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.billboard = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines a billboard transform for nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Billboard = SceneJS_NodeFactory.createNodeType("billboard");

    SceneJS.Billboard.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node is the resource definer
            this._core.spherical = (cfg.spherical !== false);
        }
        this._core.hash = "bb;";
    };

    /** Sets whether this billboard is spherical (default), where it "rotates" about the X and Y-axis,
     * if required, to face the viewpoint, or cylindrical, where it only rotates about the Y-axis.
      * @param spherical
     */
    SceneJS.Billboard.prototype.setSpherical = function (spherical) {
        this._core.spherical = spherical;
        this._engine.branchDirty(this);
        this._engine.display.imageDirty = true;
    };

    SceneJS.Billboard.prototype.getSpherical = function () {
        return this._core.spherical;
    };

    SceneJS.Billboard.prototype._compile = function (ctx) {
        coreStack[stackLen++] = this._core;
        this._engine.display.billboard = this._core;
        this._compileNodes(ctx);
        this._engine.display.billboard = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Billboard.prototype._destroy = function () {
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();