/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "stencilBuffer",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal: true,

    drawAndPick: function (frameCtx) {

        var gl = this.program.gl;

        var enabled = this.core.enabled;

        if (frameCtx.stencilbufEnabled != enabled) {
            if (enabled) {
                gl.enable(gl.STENCIL_TEST);
            } else {
                gl.disable(gl.STENCIL_TEST);
            }
            frameCtx.stencilbufEnabled = enabled;
        }

        var clearStencil = this.core.clearStencil;

        if (clearStencil !== undefined) {
            if (frameCtx.clearStencil != clearStencil) {
                gl.clearStencil(clearStencil);
                frameCtx.clearStencil = clearStencil;
            }
        }
        
        var stencilFuncFuncFront = this.core.stencilFuncFuncFront;
        var stencilFuncRefFront = this.core.stencilFuncRefFront;
        var stencilFuncMaskFront = this.core.stencilFuncMaskFront;

        if (stencilFuncFuncFront) {
            if (frameCtx.stencilFuncFuncFront != stencilFuncFuncFront ||
                frameCtx.stencilFuncRefFront != stencilFuncRefFront ||
                frameCtx.stencilFuncMaskFront != stencilFuncMaskFront
                ) {
                gl.stencilFuncSeparate(gl.FRONT, stencilFuncFuncFront, stencilFuncRefFront, stencilFuncMaskFront);
                frameCtx.stencilFuncFuncFront = stencilFuncFuncFront;
                frameCtx.stencilFuncRefFront = stencilFuncRefFront;
                frameCtx.stencilFuncMaskFront = stencilFuncMaskFront;
            }
        }

        var stencilFuncFuncBack = this.core.stencilFuncFuncBack;
        var stencilFuncRefBack = this.core.stencilFuncRefBack;
        var stencilFuncMaskBack = this.core.stencilFuncMaskBack;

        if (stencilFuncFuncBack) {
            if (frameCtx.stencilFuncFuncBack != stencilFuncFuncBack ||
                frameCtx.stencilFuncRefBack != stencilFuncRefBack ||
                frameCtx.stencilFuncMaskBack != stencilFuncMaskBack
                ) {
                gl.stencilFuncSeparate(gl.BACK, stencilFuncFuncBack, stencilFuncRefBack, stencilFuncMaskBack);
                frameCtx.stencilFuncFuncBack = stencilFuncFuncBack;
                frameCtx.stencilFuncRefBack = stencilFuncRefBack;
                frameCtx.stencilFuncMaskBack = stencilFuncMaskBack;
            }
        }

        var stencilOpSfailFront = this.core.stencilOpSfailFront;
        var stencilOpDpfailFront = this.core.stencilOpDpfailFront;
        var stencilOpDppassFront = this.core.stencilOpDppassFront;

        if (stencilOpSfailFront) {
            if (frameCtx.stencilOpSfailFront != stencilOpSfailFront ||
                frameCtx.stencilOpDpfailFront != stencilOpDpfailFront ||
                frameCtx.stencilOpDppassFront != stencilOpDppassFront
                ) {
                gl.stencilOpSeparate(gl.FRONT, stencilOpSfailFront, stencilOpDpfailFront, stencilOpDppassFront);
                frameCtx.stencilOpSfailFront = stencilOpSfailFront;
                frameCtx.stencilOpDpfailFront = stencilOpDpfailFront;
                frameCtx.stencilOpDppassFront = stencilOpDppassFront;
            }
        }

        var stencilOpSfailBack = this.core.stencilOpSfailBack;
        var stencilOpDpfailBack = this.core.stencilOpDpfailBack;
        var stencilOpDppassBack = this.core.stencilOpDppassBack;

        if (stencilOpSfailBack) {
            if (frameCtx.stencilOpSfailBack != stencilOpSfailBack ||
                frameCtx.stencilOpDpfailBack != stencilOpDpfailBack ||
                frameCtx.stencilOpDppassBack != stencilOpDppassBack
                ) {
                gl.stencilOpSeparate(gl.BACK, stencilOpSfailBack, stencilOpDpfailBack, stencilOpDppassBack);
                frameCtx.stencilOpSfailBack = stencilOpSfailBack;
                frameCtx.stencilOpDpfailBack = stencilOpDpfailBack;
                frameCtx.stencilOpDppassBack = stencilOpDppassBack;
            }
        }

        if (this.core.clear) {
            gl.clear(gl.STENCIL_BUFFER_BIT);
        }
    }
});
