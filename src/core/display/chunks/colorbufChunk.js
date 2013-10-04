/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"colorbuf",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build:function () {
    },

    drawAndPick:function (ctx) {

        if (!ctx.transparencyPass) { // Blending forced when rendering transparent bin

            var blendEnabled = this.core.blendEnabled;

            if (ctx.blendEnabled != blendEnabled) {
                var gl = this.program.gl;
                if (blendEnabled) {
                    gl.enable(gl.BLEND);
                } else {
                    gl.disable(gl.BLEND);
                }
                ctx.blendEnabled = blendEnabled;
            }
        }
    }
});
