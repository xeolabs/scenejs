/**
 * Create display state chunk type for draw render of material transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "name",

    build: function () {
        this._uPickColor = this.program.pick.getUniform("SCENEJS_uPickColor");
    },

    pick: function (frameCtx) {

        if (this._uPickColor && this.core.name) {

            frameCtx.pickNames[frameCtx.pickIndex++] = this.core;

            var b = frameCtx.pickIndex >> 16 & 0xFF;
            var g = frameCtx.pickIndex >> 8 & 0xFF;
            var r = frameCtx.pickIndex & 0xFF;

            this._uPickColor.setValue([r / 255, g / 255, b / 255]);
        }
    }
});