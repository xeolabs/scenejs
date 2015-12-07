(function () {

    /**
     * The default state core singleton for {@link SceneJS.Name} nodes
     */
    var defaultCore = {
        type:"name",
        stateId:SceneJS._baseStateId++,
        name:null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.name = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which assigns a pick name to the {@link SceneJS.Geometry} nodes in its subgraph.
     * @extends SceneJS.Node
     */
    SceneJS.Name = SceneJS_NodeFactory.createNodeType("name");

    SceneJS.Name.prototype._init = function (params) {
        this.setName(params.name);
        this._core.nodeId = this.id;
    };

    SceneJS.Name.prototype.setName = function (name) {
        this._core.name = name || "unnamed";
        this._engine.branchDirty(this); // Need to recompile name path
    };

    SceneJS.Name.prototype.getName = function () {
        return this._core.name;
    };

    SceneJS.Name.prototype._compile = function (ctx) {

        this._engine.display.name = coreStack[stackLen++] = this._core;

        // (Re)build name path
        var path = [];
        var name;
        for (var i = 0; i < stackLen; i++) {
            name = coreStack[i].name;
            if (name) {
                path.push(name);
            }
        }
        this._core.path = path.join(".");

        this._compileNodes(ctx);
        this._engine.display.name = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };
})();