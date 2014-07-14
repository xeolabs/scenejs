/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "draw",

    /**
     * As we apply a list of state chunks in a {@link SceneJS_Display}, we track the ID of each chunk
     * in order to avoid redundantly re-applying the same chunk.
     *
     * We don't want that for draw chunks however, because they contain GL drawElements calls,
     * which we need to do for each object.
     */
    unique: true,

    build: function () {
    },

    drawAndPick: function (ctx) {

        if (ctx.validateShaders) {

            // Can only validate program just before draw call,
            // which is when the program variables have values loaded.
            if (ctx.pick) {
                this.program.pick.validate();
            } else {
                this.program.draw.validate();
            }
        }

        var gl = this.program.gl;

        gl.drawElements(this.core.primitive, this.core.indexBuf.numItems, gl.UNSIGNED_SHORT, 0);
    }
});
