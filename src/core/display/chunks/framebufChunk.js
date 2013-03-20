/**
 *   Create display state chunk type for draw and pick render of framebuf
 */
SceneJS_ChunkFactory.createChunkType({

    type: "framebuf",

    build: function() {
    },

    drawAndPick: function(ctx) {

        if (ctx.framebuf) {

            this.program.gl.finish(); // Force framebuf to complete

            ctx.framebuf.unbind();
        }

        var framebuf = this.core.framebuf;

        if (framebuf) {

            framebuf.bind();

            ctx.framebuf = framebuf;  // Must flush on cleanup
        }
    }
});