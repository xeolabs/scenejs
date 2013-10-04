/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"view",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build:function () {
    },

    drawAndPick:function (ctx) {

        var scissorTestEnabled = this.core.scissorTestEnabled;

        if (ctx.scissorTestEnabled != scissorTestEnabled) {
            var gl = this.program.gl;
            if (scissorTestEnabled) {
                gl.enable(gl.SCISSOR_TEST);
            } else {
                gl.disable(gl.SCISSOR_TEST);
            }
            ctx.scissorTestEnabled = scissorTestEnabled;
        }
    }
});
