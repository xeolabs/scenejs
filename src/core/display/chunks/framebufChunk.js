/**
 *   Create display state chunk type for draw and pick render of framebuf
 */
SceneJS_ChunkFactory.createChunkType({

    type: "framebuf",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build: function() {
    },

    drawAndPick: function(ctx) {

        var gl = this.program.gl;

        if (ctx.framebuf) {

            gl.finish(); // Force framebuf to complete

            ctx.framebuf.unbind();

            ctx.framebuf = null;
        }

        var framebuf = this.core.framebuf;

        if (framebuf) {

            framebuf.bind();

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

            ctx.framebuf = framebuf;  // Must flush on cleanup
        }
    }
});