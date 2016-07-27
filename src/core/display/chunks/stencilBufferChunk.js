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

        if (frameCtx.clearStencil != clearStencil) {
            gl.clearStencil(clearStencil);
            frameCtx.clearStencil = clearStencil;
        }

        var stencilFunc = this.core.stencilFunc;

        if (frameCtx.stencilFunc != stencilFunc) {
            gl.stencilFunc(stencilFunc.func, stencilFunc.ref, stencilFunc.mask);
            frameCtx.stencilFunc = stencilFunc;
        }

        var stencilOp = this.core.stencilOp;

        if (frameCtx.stencilOp != stencilOp) {
            gl.stencilOp(stencilOp.sfail, stencilOp.dpfail, stencilOp.dppass);
            frameCtx.stencilOp = stencilOp;
        }

        if (this.core.clear) {
            gl.clear(gl.STENCIL_BUFFER_BIT);
        }
    }
});
