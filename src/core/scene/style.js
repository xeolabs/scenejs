(function () {

    // The default state core singleton for {@link SceneJS.Line} nodes
    var defaultCore = {
        type:"style",
        stateId:SceneJS._baseStateId++,
        lineWidth:1.0
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.style = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures style parameters such as line width for subnodes
     * @extends SceneJS.Node
     */
    SceneJS.Style = SceneJS_NodeFactory.createNodeType("style");

    SceneJS.Style.prototype._init = function (params) {
        if (params.lineWidth != undefined) {
            this.setLineWidth(params.lineWidth);
        }
    };

    /**
     * Sets the line width
     *
     * Line width is initially 1.
     *
     * @param lineWidth The line width
     * @return {*}
     */
    SceneJS.Style.prototype.setLineWidth = function (lineWidth) {
        if (this._core.lineWidth != lineWidth) {
            this._core.lineWidth = lineWidth;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Gets the line width
     * Initial value will be 1.
     *
     * @return Boolean
     */
    SceneJS.Style.prototype.getLineWidth = function () {
        return this._core.lineWidth;
    };

    SceneJS.Style.prototype._compile = function (ctx) {
        this._engine.display.style = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.style = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();