(function () {

    var lookup = {
        // stencilFunc.func
        never: "NEVER", 
        less: "LESS",
        equal: "EQUAL",
        lequal: "LEQUAL",
        greater: "GREATER",
        notequal: "NOTEQUAL",
        gequal: "GEQUAL",
        always: "ALWAYS",

        // stencilOp
        keep: "KEEP",
        zero: "ZERO",
        replace: "REPLACE",
        incr: "INCR",
        incr_wrap: "INCR_WRAP",
        decr: "DECR",
        decr_wrap: "DECR_WRAP",
        invert: "INVERT",

        // face
        front: "FRONT",
        back: "BACK",
        front_and_back: "FRONT_AND_BACK"
    };

    // The default state core singleton for {@link SceneJS.StencilBuf} nodes
    var defaultCore = {
        type: "stencilBuffer",
        stateId: SceneJS._baseStateId++,
        enabled: false,
        clearStencil: 0,
        
        // Lazy init stencilFunc when we can get a context

        stencilFuncFuncFront: null,
        stencilFuncRefFront: 0,
        stencilFuncMaskFront: 0xff,

        stencilFuncFuncBack: null,
        stencilFuncRefBack: 0,
        stencilFuncMaskBack: 0xff,

        stencilOpSfailFront: null,
        stencilOpDpfailFront: null,
        stencilOpDppassFront: null,

        stencilOpSfailBack: null,
        stencilOpDpfailBack: null,
        stencilOpDppassBack: null,

        _stencilFuncFuncStateFront: "always",
        _stencilFuncRefStateFront: 0,
        _stencilFuncMaskStateFront: 0xff,

        _stencilFuncFuncStateBack: "always",
        _stencilFuncRefStateBack: 0,
        _stencilFuncMaskStateBack: 0xff,

        _stencilOpSfailStateFront: "keep",
        _stencilOpDpfailStateFront: "keep",
        _stencilOpDppassStateFront: "keep",

        _stencilOpSfailStateBack: "keep",
        _stencilOpDpfailStateBack: "keep",
        _stencilOpDppassStateBack: "keep"
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            // Lazy-init stencilFunc now we can get a context
            if (defaultCore.stencilFuncFuncFront === null) { 
                defaultCore.stencilFuncFuncFront = params.engine.canvas.gl.ALWAYS;
            }

            if (defaultCore.stencilFuncFuncBack === null) {
                defaultCore.stencilFuncFuncBack = params.engine.canvas.gl.ALWAYS;
            }

            if (defaultCore.stencilOpSfailFront === null) {
                defaultCore.stencilOpSfailFront = params.engine.canvas.gl.KEEP;
                defaultCore.stencilOpDpfailFront = params.engine.canvas.gl.KEEP;
                defaultCore.stencilOpDppassFront = params.engine.canvas.gl.KEEP;
            }

            if (defaultCore.stencilOpSfailBack === null) {
                defaultCore.stencilOpSfailBack = params.engine.canvas.gl.KEEP;
                defaultCore.stencilOpDpfailBack = params.engine.canvas.gl.KEEP;
                defaultCore.stencilOpDppassBack = params.engine.canvas.gl.KEEP;
            }

            params.engine.display.stencilBuffer = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the stencil buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.StencilBuf = SceneJS_NodeFactory.createNodeType("stencilBuffer");

    SceneJS.StencilBuf.prototype._init = function (params) {

        if (params.enabled != undefined) {
            this.setEnabled(params.enabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setEnabled(true);
        }

        if (params.clearStencil != undefined) {
            this.setClearStencil(params.clearStencil);
        } else if (this._core.useCount == 1) {
            this.setClearStencil(0);
        }

        if (params.stencilFunc != undefined) {
            this.setStencilFunc(params.stencilFunc);
        } else if (this._core.useCount == 1) {
            this.setStencilFunc({
                face: "front_back",
                func: "always", 
                ref: 1, 
                mask: 0xff
            });
        }

        if (params.stencilOp != undefined) {
            this.setStencilOp(params.stencilOp);
        } else if (this._core.useCount == 1) {
            this.setStencilOp({
                face: "front_back",
                sfail: "keep", 
                dpfail: "keep", 
                dppass: "keep"
            });
        }

        if (params.clear != undefined) {
            this.setClear(params.clear);
        }
    };

    /**
     * Enable or disable the stencil buffer
     *
     * @param enabled Specifies whether stencil buffer is enabled or not
     * @return {*}
     */
    SceneJS.StencilBuf.prototype.setEnabled = function (enabled) {
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not the stencil buffer is enabled
     *
     * @return Boolean
     */
    SceneJS.StencilBuf.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    /**
     * Sets whether or not to clear the stencil buffer before each render
     *
     * @param clear
     * @return {*}
     */
    SceneJS.StencilBuf.prototype.setClear = function (clear) {
        if (this._core.clear != clear) {
            this._core.clear = clear;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not the stencil buffer is cleared before each render
     *
     * @return Boolean
     */
    SceneJS.StencilBuf.prototype.getClear = function () {
        return this._core.clear;
    };
    
    /**
     * Specify the clear value for the stencil buffer.
     * Initial value is 1, and the given value will be clamped to [0..1].
     * @param clearStencil
     * @return {*}
     */
    SceneJS.StencilBuf.prototype.setClearStencil = function (clearStencil) {
        if (this._core.clearStencil != clearStencil) {
            this._core.clearStencil = clearStencil;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get the clear value for the stencil buffer
     *
     * @return Number
     */
    SceneJS.StencilBuf.prototype.getClearStencil = function () {
        return this._core.clearStencil;
    };

    /**
     * Sets the stencil comparison function
     * 
     * @param {String} params - The stencil comparison function
     * @return {*}
     */
    SceneJS.StencilBuf.prototype.setStencilFunc = function (params) {

        var faceFront = false;
        var faceBack = false;

        var funcFront = params.func || 'always';
        var refFront = params.ref !== undefined ? params.ref : 1;
        var maskFront = params.mask !== undefined ? params.mask : 0xff;

        var funcBack = funcFront;
        var refBack = refFront;
        var maskBack = maskFront;

        var face = params.face || 'front_and_back';

        if (params.front || params.back) {

            if (params.front) {
                faceFront = true;

                funcFront = params.front.func || 'always';
                refFront = params.front.ref !== undefined ? params.front.ref : 1;
                maskFront = params.front.mask !== undefined ? params.front.mask : 0xff;
            }

            if (params.back) {
                faceBack = true;

                funcBack = params.back.func || 'always';
                refBack = params.back.ref !== undefined ? params.back.ref : 1;
                maskBack = params.back.mask !== undefined ? params.back.mask : 0xff;
            }

        } else {

            faceFront = face === 'front' || face === 'front_and_back';
            faceBack = face === 'back' || face === 'front_and_back';

        }

        if (refFront !== refBack || maskFront !== maskBack) {
            throw "WebGL only allow same value for stencil ref and mask of front and back faces";
        }

        if (faceFront) {
            // Front
            if (this._core._stencilFuncFuncStateFront != funcFront || 
                this._core._stencilFuncRefStateFront != refFront ||
                this._core._stencilFuncMaskStateFront != maskFront 
                ) {

                var funcEnumName = lookup[funcFront];
                if (funcEnumName == undefined) {
                    throw "unsupported value for 'stencilFunc' attribute on stencilBuffer node: '" + stencilFunc.func
                        + "' - supported values are 'keep', 'always', 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'";
                }

                this._core.stencilFuncFuncFront = this._engine.canvas.gl[funcEnumName];
                this._core.stencilFuncRefFront = refFront;
                this._core.stencilFuncMaskFront = maskFront;

                this._core._stencilFuncFuncStateFront = funcFront;
                this._core._stencilFuncRefStateFront = refFront;
                this._core._stencilFuncMaskStateFront = maskFront;

                this._engine.display.imageDirty = true;
            }
        } 

        if (faceBack) {
            // Back
            if (this._core._stencilFuncFuncStateBack != funcBack || 
                this._core._stencilFuncRefStateBack != refBack ||
                this._core._stencilFuncMaskStateBack != maskBack 
                ) {

                var funcEnumName = lookup[funcBack];
                if (funcEnumName == undefined) {
                    throw "unsupported value for 'stencilFunc' attribute on stencilBuffer node: '" + stencilFunc.func
                        + "' - supported values are 'keep', 'always', 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'";
                }

                this._core.stencilFuncFuncBack = this._engine.canvas.gl[funcEnumName];
                this._core.stencilFuncRefBack = refBack;
                this._core.stencilFuncMaskBack = maskBack;

                this._core._stencilFuncFuncStateBack = funcBack;
                this._core._stencilFuncRefStateBack = refBack;
                this._core._stencilFuncMaskStateBack = maskBack;

                this._engine.display.imageDirty = true;
            }
        } 

        return this;
    };

    /**
     * Sets the stencil comparison function.
     * Supported values are 'keep', 'zero', 'replace', 'incr', 'incr_wrap', 'decr', 'decr_wrap', 'invert'
     * @param {Object} params - stencilOp parameters
     * @param {String} params.
     * @return {*}
     */
    SceneJS.StencilBuf.prototype.setStencilOp = function (params) {

        var faceFront = false;
        var faceBack = false;

        var sfailFront = params.sfail || 'keep';
        var dpfailFront = params.dpfail || 'keep';
        var dppassFront = params.dppass || 'keep';

        var sfailBack = sfailFront;
        var dpfailBack = dpfailFront;
        var dppassBack = dppassFront;

        var face = params.face || 'front_and_back';

        if (params.front || params.back) {

            if (params.front) {
                faceFront = true;

                sfailFront = params.front.sfail || 'keep';
                dpfailFront = params.front.dpfail || 'keep';
                dppassFront = params.front.dppass || 'keep';
            }

            if (params.back) {
                faceBack = true;

                funcBack = params.back.sfail || 'keep';
                refBack = params.back.dpfail || 'keep';
                maskBack = params.back.dppass || 'keep';
            }

        } else {

            faceFront = face === 'front' || face === 'front_and_back';
            faceBack = face === 'back' || face === 'front_and_back';

        }

        if (faceFront) {
            // Front
            if (this._core._stencilOpSfailStateFront != sfailFront || 
                this._core._stencilOpDpfailStateFront != dpfailFront ||
                this._core._stencilOpDppassStateFront != dppassFront 
                ) {

                var sfail = lookup[sfailFront];
                var dpfail = lookup[dpfailFront];
                var dppass = lookup[dppassFront];
                if (sfail == undefined || dpfail == undefined || dppass == undefined) {
                    throw "unsupported value for 'StencilOp' attribute on stencilBuffer node - supported values are 'keep', 'zero', 'replace', 'incr', 'incr_wrap', 'decr', 'decr_wrap', 'invert'";
                }

                this._core.stencilOpSfailFront = this._engine.canvas.gl[sfail];
                this._core.stencilOpDpfailFront = this._engine.canvas.gl[dpfail];
                this._core.stencilOpDppassFront = this._engine.canvas.gl[dppass];

                this._core._stencilOpSfailStateFront = sfailFront;
                this._core._stencilOpSfailStateFront = dpfailFront;
                this._core._stencilOpSfailStateFront = dppassFront;

                this._engine.display.imageDirty = true;
            }
        } 
        
        if (faceBack) {
            // Back
            if (this._core._stencilOpSfailStateBack != sfailBack || 
                this._core._stencilOpDpfailStateBack != dpfailBack ||
                this._core._stencilOpDppassStateBack != dppassBack 
                ) {

                var sfail = lookup[sfailBack];
                var dpfail = lookup[dpfailBack];
                var dppass = lookup[dppassBack];
                if (sfail == undefined || dpfail == undefined || dppass == undefined) {
                    throw "unsupported value for 'StencilOp' attribute on stencilBuffer node - supported values are 'keep', 'zero', 'replace', 'incr', 'incr_wrap', 'decr', 'decr_wrap', 'invert'";
                }

                this._core.stencilOpSfailBack = this._engine.canvas.gl[sfail];
                this._core.stencilOpDpfailBack = this._engine.canvas.gl[dpfail];
                this._core.stencilOpDppassBack = this._engine.canvas.gl[dppass];

                this._core._stencilOpSfailStateBack = sfailBack;
                this._core._stencilOpSfailStateBack = dpfailBack;
                this._core._stencilOpSfailStateBack = dppassBack;

                this._engine.display.imageDirty = true;
            }
        }

        return this;
    };

    SceneJS.StencilBuf.prototype.getStencilFuncFront = function () {
        return {
            func: this._core._stencilFuncFuncStateFront,
            ref: this._core._stencilFuncRefStateFront,
            mask: this._core._stencilFuncMaskStateFront
        };
    };

    SceneJS.StencilBuf.prototype.getStencilFuncBack = function () {
        return {
            func: this._core._stencilFuncFuncStateBack,
            ref: this._core._stencilFuncRefStateBack,
            mask: this._core._stencilFuncMaskStateBack
        };
    };

    SceneJS.StencilBuf.prototype.getStencilOpFront = function () {
        return {
            sfail: this._core._stencilOpSfailStateFront, 
            dpfail: this._core._stencilOpDpfailStateFront,
            dppass: this._core._stencilOpDppassStateFront
        };
    };

    SceneJS.StencilBuf.prototype.getStencilOpBack = function () {
        return {
            sfail: this._core._stencilOpSfailStateBack, 
            dpfail: this._core._stencilOpDpfailStateBack,
            dppass: this._core._stencilOpDppassStateBack
        };
    };

    SceneJS.StencilBuf.prototype._compile = function (ctx) {
        this._engine.display.stencilBuffer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.stencilBuffer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();