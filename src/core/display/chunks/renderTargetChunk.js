/**
 *   Create display state chunk type for draw and pick render of renderTarget
 */
SceneJS_ChunkFactory.createChunkType({

    type: "renderTarget",

    // Avoid reapplication of this chunk type after a program switch.
    programGlobal: true,

    build: function () {
        this._uDepthMode = this.program.draw.getUniformLocation("SCENEJS_uDepthMode");
    },

    drawAndPick: function (frameCtx) {

        // Flush and unbind last render buffer
        if (frameCtx.renderBuf) {
            var gl = this.program.gl;
            gl.finish();
            frameCtx.renderBuf.unbind();
            frameCtx.renderBuf = null;
        }

        // Bind this chunk's render buffer, if any

        var target = frameCtx.targetList[frameCtx.targetIndex++];
        if (target) {
            var renderBuf = target.renderBuf;
            if (renderBuf) {
                frameCtx.depthMode = (target.bufType == "depth");
                var gl = this.program.gl;
                gl.uniform1i(this._uDepthMode, frameCtx.depthMode);
                renderBuf.bind();
                if (!frameCtx.depthMode) {
                    if (frameCtx.blendEnabled) { //  Enable blending
                        gl.enable(gl.BLEND);
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    }
                }
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                frameCtx.renderBuf = renderBuf;
            }
        }
    }
});