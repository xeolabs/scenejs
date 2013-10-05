(function () {

    var lookup = {
        less:"LESS",
        equal:"EQUAL",
        lequal:"LEQUAL",
        greater:"GREATER",
        notequal:"NOTEQUAL",
        gequal:"GEQUAL"
    };

    // The default state core singleton for {@link SceneJS.DepthBuf} nodes
    var defaultCore = {
        type:"depthbuf",
        stateId:SceneJS._baseStateId++,
        enabled:true,
        clearDepth:1,
        depthFunc:null, // Lazy init depthFunc when we can get a context
        _depthFuncName:"less"
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            if (defaultCore.depthFunc === null) { // Lazy-init depthFunc now we can get a context
                defaultCore.depthFunc = params.engine.canvas.gl.LESS;
            }
            params.engine.display.depthbuf = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the depth buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.DepthBuf = SceneJS_NodeFactory.createNodeType("depthbuf");

    SceneJS.DepthBuf.prototype._init = function (params) {

        if (params.enabled != undefined) {
            this.setEnabled(params.enabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setEnabled(true);
        }

        if (params.clearDepth != undefined) {
            this.setClearDepth(params.clearDepth);
        } else if (this._core.useCount == 1) {
            this.setClearDepth(1);
        }

        if (params.depthFunc != undefined) {
            this.setDepthFunc(params.depthFunc);
        } else if (this._core.useCount == 1) {
            this.setDepthFunc("less");
        }
    };

    /**
     * Enable or disable the depth buffer
     *
     * @param enabled Specifies whether depth buffer is enabled or not
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setEnabled = function (enabled) {
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not the depth buffer is enabled
     *
     * @return Boolean
     */
    SceneJS.DepthBuf.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    /**
     * Specify the clear value for the depth buffer.
     * Initial value is 1, and the given value will be clamped to [0..1].
     * @param clearDepth
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setClearDepth = function (clearDepth) {
        if (this._core.clearDepth != clearDepth) {
            this._core.clearDepth = clearDepth;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get the clear value for the depth buffer
     *
     * @return Number
     */
    SceneJS.DepthBuf.prototype.getClearDepth = function () {
        return this._core.clearDepth;
    };

    /**
     * Sets the depth comparison function.
     * Supported values are 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'
     * @param {String} depthFunc The depth comparison function
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setDepthFunc = function (depthFunc) {
        if (this._core._depthFuncName != depthFunc) {
            var enumName = lookup[depthFunc];
            if (enumName == undefined) {
                throw "unsupported value for 'clearFunc' attribute on depthbuf node: '" + depthFunc
                    + "' - supported values are 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'";
            }
            this._core.depthFunc = this._engine.canvas.gl[enumName];
            this._core._depthFuncName = depthFunc;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Returns the depth comparison function
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.getDepthFunc = function () {
        return this._core._depthFuncName;
    };

    SceneJS.DepthBuf.prototype._compile = function () {
        this._engine.display.depthbuf = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.depthbuf = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();