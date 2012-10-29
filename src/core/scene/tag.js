(function() {

    /**
     * The default state core singleton for {@link SceneJS.Tag} nodes
     */
    var defaultCore = {
        type: "tag",
        stateId: SceneJS._baseStateId++,
        tag : null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.tag = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which assigns a symbolic tag name to the {@link SceneJS.Geometry} nodes in its subgraph.
     * The subgraph can then be included or excluded from scene rendering using {@link SceneJS.Scene#setTagMask}.
     * @extends SceneJS.Node
     */
    SceneJS.Tag = SceneJS_NodeFactory.createNodeType("tag");

    SceneJS.Tag.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node defines the resource
            if (!params.tag) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "tag node attribute missing : 'tag'");
            }
            this.setTag(params.tag);
        }
    };

    SceneJS.Tag.prototype.setTag = function(tag) {

        var core = this._core;

        core.tag = tag;
        core.pattern = null;    // To be recomputed
        core.matched = false;   // To be rematched

        this._engine.display.drawListDirty = true;
    };

    SceneJS.Tag.prototype.getTag = function() {
        return this._core.tag;
    };

    SceneJS.Tag.prototype._compile = function() {
        this._engine.display.tag = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.tag = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };
})();