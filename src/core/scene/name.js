(function() {

    /**
     * The default state core singleton for {@link SceneJS.Name} nodes
     */
    var defaultCore = {
        type: "name",
        stateId: SceneJS._baseStateId++,
        name: null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.name = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which assigns a pick name to the {@link SceneJS.Geometry} nodes in its subgraph.
     * @extends SceneJS.Node
     */
    SceneJS.Name = SceneJS_NodeFactory.createNodeType("name");

    SceneJS.Name.prototype._init = function(params) {
        if (this._core.useCount == 1) {
            this.setName(params.name);
        }
    };

    SceneJS.Name.prototype.setName = function(name) {
        this._core.name = name || "unnamed";
        this._engine.display.imageDirty = true;
    };

    SceneJS.Name.prototype.getName = function() {
        return this._core.name;
    };

    SceneJS.Name.prototype._compile = function() {
        this._engine.display.name = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.name = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };
})();