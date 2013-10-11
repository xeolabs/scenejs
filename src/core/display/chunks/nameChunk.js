/**
 * Create display state chunk type for draw render of material transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "name",

    build : function() {
        this._uPickColor = this.program.pick.getUniformLocation("SCENEJS_uPickColor");
    },

    pick : function(ctx) {

        if (this._uPickColor && this.core.name) {

            ctx.pickNames[ctx.pickIndex++] = this.core;

            var b = ctx.pickIndex >> 16 & 0xFF;
            var g = ctx.pickIndex >> 8 & 0xFF;
            var r = ctx.pickIndex & 0xFF;

            this.program.gl.uniform3fv(this._uPickColor, [r / 255, g / 255, b / 255]);
        }
    }
});