/**
 *   Create display state chunk type for draw and pick render of depthTarget
 */
SceneJS_ChunkFactory.createChunkType({

    type: "depthTarget",

    // Avoid reapplication of this chunk type after a program switch.
    programGlobal: true,

    build: function () {
    },

    drawAndPick: function (frameCtx) {

        // Flush and unbind last render buffer
        if (frameCtx.depthRenderBuf) {
            var gl = this.program.gl;
            gl.finish();
            frameCtx.depthRenderBuf.unbind();
            frameCtx.depthRenderBuf = null;
            frameCtx.depthPass = false;
        }

        // Bind this chunk's render buffer, if any
        var renderBuf = this.core.renderBuf;
        if (renderBuf) {
            renderBuf.bind();
            var gl = this.program.gl;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            frameCtx.depthRenderBuf = renderBuf;
            frameCtx.depthPass = true;
        }
    }
});