/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"style",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    drawAndPick:function (ctx) {

        var lineWidth = this.core.lineWidth;

        if (ctx.lineWidth != lineWidth) {
            var gl = this.program.gl;
            gl.lineWidth(lineWidth);
            ctx.lineWidth = lineWidth;
        }
    }
});
