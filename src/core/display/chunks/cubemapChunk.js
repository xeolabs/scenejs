SceneJS_ChunkFactory.createChunkType({

    type: "cubemap",

    draw: function (ctx) {
        if (this.core.texture) {
            this.program.draw.bindTexture("SCENEJS_uEnvSampler", this.core.texture, ctx.textureUnit++);
        }
    }
});