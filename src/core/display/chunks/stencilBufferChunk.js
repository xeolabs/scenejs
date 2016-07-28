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
        

        var stencilFuncFront = this.core.stencilFuncFront;

        if (frameCtx.stencilFuncFront != stencilFuncFront && stencilFuncFront) {
            gl.stencilFuncSeparate(gl.FRONT, stencilFuncFront.func, stencilFuncFront.ref, stencilFuncFront.mask);
            frameCtx.stencilFuncFront = stencilFuncFront;
        }

        var stencilFuncBack = this.core.stencilFuncBack;
        if (frameCtx.stencilFuncBack != stencilFuncBack && stencilFuncBack) {
            gl.stencilFuncSeparate(gl.BACK, stencilFuncBack.func, stencilFuncBack.ref, stencilFuncBack.mask);
            frameCtx.stencilFuncBack = stencilFuncBack;
        }


        var stencilOpFront = this.core.stencilOpFront;

        if (frameCtx.stencilOpFront != stencilOpFront && stencilOpFront) {
            gl.stencilOpSeparate(gl.FRONT, stencilOpFront.sfail, stencilOpFront.dpfail, stencilOpFront.dppass);
            frameCtx.stencilOpFront = stencilOpFront;
        }

        var stencilOpBack = this.core.stencilOpBack;

        if (frameCtx.stencilOpBack != stencilOpBack && stencilOpBack) {
            gl.stencilOpSeparate(gl.BACK, stencilOpBack.sfail, stencilOpBack.dpfail, stencilOpBack.dppass);
            frameCtx.stencilOpBack = stencilOpBack;
        }


        if (this.core.clear) {
            gl.clear(gl.STENCIL_BUFFER_BIT);
        }
    }
});
