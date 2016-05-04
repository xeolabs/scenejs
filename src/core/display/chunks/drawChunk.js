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

        this._uPickColor = this.program.pick.getUniform("SCENEJS_uPickColor");
    },


    draw: function (frameCtx) {

        var core = this.core;
        var gl = this.program.gl;

        if (this._depthModeDraw) {
            this._depthModeDraw.setValue(frameCtx.depthMode);
        }

        if (core.indexBuf) {
            gl.drawElements(core.primitive, core.indexBuf.numItems, core.indexBuf.itemType, 0);            
        } else {
            gl.drawArrays(core.primitive, 0, core.vertexBuf.numItems / 3);
        }

        //frameCtx.textureUnit = 0;
    },

    pick: function (frameCtx) {

        var core = this.core;
        var gl = this.program.gl;

        if (frameCtx.pickObject || frameCtx.pickRegion) {

            if (frameCtx.pickObject) {

                if (this._uPickColor) {

                    var a = frameCtx.pickIndex >> 24 & 0xFF;
                    var b = frameCtx.pickIndex >> 16 & 0xFF;
                    var g = frameCtx.pickIndex >> 8 & 0xFF;
                    var r = frameCtx.pickIndex & 0xFF;

                    frameCtx.pickIndex++;

                    this._uPickColor.setValue([r / 255, g / 255, b / 255, a / 255]);
                }
            }

            gl.drawElements(core.primitive, core.indexBuf.numItems, core.indexBuf.itemType, 0);

        } else if (frameCtx.pickTriangle) {

            var pickPositions = core.getPickPositions();

            if (pickPositions) {
                gl.drawArrays(core.primitive, 0, pickPositions.numItems / 3);
            }
        }
    }
});
