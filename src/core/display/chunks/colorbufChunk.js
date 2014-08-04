/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"colorbuf",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build:function () {
    },

    drawAndPick:function (frameCtx) {

        if (!frameCtx.transparent) { // Blending forced when rendering transparent bin

            var blendEnabled = this.core.blendEnabled;

            if (frameCtx.blendEnabled != blendEnabled) {
                var gl = this.program.gl;
                if (blendEnabled) {
                    gl.enable(gl.BLEND);
                } else {
                    gl.disable(gl.BLEND);
                }
                frameCtx.blendEnabled = blendEnabled;
            }
        }
    }
});
