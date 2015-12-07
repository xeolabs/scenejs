(function () {

    // The default state core singleton for {@link SceneJS.View} nodes
    var defaultCore = {
        type:"view",
        stateId:SceneJS._baseStateId++,
        scissorTestEnabled:false
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.view = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures view parameters such as depth range, scissor test and viewport
     * @extends SceneJS.Node
     * void depthRange(floatzNear, floatzFar)
     zNear: Clamped to the range 0 to 1 Must be <= zFar
     zFar: Clamped to the range 0 to 1.
     void scissor(int x, int y, long width, long height)
     void viewport(int x, int y, long width, long height)
     */
    SceneJS.View = SceneJS_NodeFactory.createNodeType("view");

    SceneJS.View.prototype._init = function (params) {

        if (params.scissorTestEnabled != undefined) {
            this.setScissorTestEnabled(params.scissorTestEnabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setScissorTestEnabled(false);
        }
    };

    /**
     * Enable or disables scissor test.
     *
     * When enabled, the scissor test will discards fragments that are outside the scissor box.
     *
     * Scissor test is initially disabled.
     *
     * @param scissorTestEnabled Specifies whether scissor test is enabled or not
     * @return {*}
     */
    SceneJS.View.prototype.setScissorTestEnabled = function (scissorTestEnabled) {
        if (this._core.scissorTestEnabled != scissorTestEnabled) {
            this._core.scissorTestEnabled = scissorTestEnabled;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not scissor test is enabled.
     * Initial value will be false.
     *
     * @return Boolean
     */
    SceneJS.View.prototype.getScissorTestEnabled = function () {
        return this._core.scissorTestEnabled;
    };

    SceneJS.View.prototype._compile = function (ctx) {
        this._engine.display.view = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.view = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();