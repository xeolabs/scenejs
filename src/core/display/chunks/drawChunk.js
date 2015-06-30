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
        this._depthModeDraw = this.program.draw.getUniform("SCENEJS_uDepthMode");
        this._depthModePick = this.program.pick.getUniform("SCENEJS_uDepthMode");
    },

    drawAndPick: function (frameCtx) {

        var gl = this.program.gl;

        if (frameCtx.pick) {
            if (this._depthModePick) {
                this._depthModePick.setValue(frameCtx.depthMode);
            }
        } else {
            if (this._depthModeDraw) {
                this._depthModeDraw.setValue(frameCtx.depthMode);
            }
        }

        gl.drawElements(this.core.primitive, this.core.indexBuf.numItems, this.core.indexBuf.itemType, 0);

        //frameCtx.textureUnit = 0;
    }
});
