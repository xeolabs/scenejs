(function () {

    // The default state core singleton for {@link SceneJS.ColorBuffer} nodes
    var defaultCore = {
        type: "colorBuffer",
        stateId: SceneJS._baseStateId++,
        blendEnabled: false,
        colorMask: { r: true, g: true, b: true, a: true }
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.colorBuffer = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the color buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.ColorBuffer = SceneJS_NodeFactory.createNodeType("colorBuffer");

    SceneJS.ColorBuffer.prototype._init = function (params) {
        if (params.blendEnabled != undefined) {
            this.setBlendEnabled(params.blendEnabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setBlendEnabled(false);
        }
        this.setColorMask(params);
    };

    /**
     * Enable or disable blending
     *
     * @param blendEnabled Specifies whether depth buffer is blendEnabled or not
     */
    SceneJS.ColorBuffer.prototype.setBlendEnabled = function (blendEnabled) {
        if (this._core.blendEnabled != blendEnabled) {
            this._core.blendEnabled = blendEnabled;
            this._engine.display.imageDirty = true;
        }
        this._engine.display.imageDirty = true;
    };

    /**
     * Get whether or not blending is enabled
     * @return Boolean
     */
    SceneJS.ColorBuffer.prototype.getBlendEnabled = function () {
        return this._core.blendEnabled;
    };

    /**
     * Enable and disable writing of buffer's color components.
     * Components default to true where not given.
     * @param mask The mask
     */
    SceneJS.ColorBuffer.prototype.setColorMask = function (mask) {
        this._core.colorMask =  {
            r: mask.r != undefined && mask.r != null ? mask.r : true,
            g: mask.g != undefined && mask.g != null ? mask.g : true,
            b: mask.b != undefined && mask.b != null ? mask.b : true,
            a: mask.a != undefined && mask.a != null ? mask.a : true
        };
        this._engine.display.imageDirty = true;
    };

    /**
     * Gets the color mask
     * @return {{}}
     */
    SceneJS.ColorBuffer.prototype.getColorMask = function () {
        return this._core.colorMask;
    };

    SceneJS.ColorBuffer.prototype._compile = function (ctx) {
        this._engine.display.colorBuffer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.colorBuffer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        this._engine.display.imageDirty = true;
    };

})();