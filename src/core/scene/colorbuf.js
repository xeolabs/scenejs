(function () {

    // The default state core singleton for {@link SceneJS.ColorBuf} nodes
    var defaultCore = {
        type:"colorbuf",
        stateId:SceneJS._baseStateId++,
        blendEnabled:false
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.colorbuf = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the color buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.ColorBuf = SceneJS_NodeFactory.createNodeType("colorbuf");

    SceneJS.ColorBuf.prototype._init = function (params) {

        if (params.blendEnabled != undefined) {
            this.setBlendEnabled(params.blendEnabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setBlendEnabled(false);
        }
    };

    /**
     * Enable or disable blending
     *
     * @param blendEnabled Specifies whether depth buffer is blendEnabled or not
     * @return {*}
     */
    SceneJS.ColorBuf.prototype.setBlendEnabled = function (blendEnabled) {
        if (this._core.blendEnabled != blendEnabled) {
            this._core.blendEnabled = blendEnabled;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not blending is enabled
     *
     * @return Boolean
     */
    SceneJS.ColorBuf.prototype.getBlendEnabled = function () {
        return this._core.blendEnabled;
    };

    SceneJS.ColorBuf.prototype._compile = function (ctx) {
        this._engine.display.colorbuf = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.colorbuf = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();