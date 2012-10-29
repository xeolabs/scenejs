/**
 *   Create display state chunk type for draw and pick render of frameBuf
 */
SceneJS_ChunkFactory.createChunkType({

    type: "frameBuf",

    build: function() {
    },

    drawAndPick: function(ctx) {

        if (ctx.frameBuf) {

            this.program.gl.finish(); // Force frameBuf to complete
            
            ctx.frameBuf.unbind();
        }

        var frameBuf = this.core.frameBuf;

        if (frameBuf) {

            frameBuf.bind();

            ctx.frameBuf = frameBuf;  // Must flush on cleanup
        }
    }
});