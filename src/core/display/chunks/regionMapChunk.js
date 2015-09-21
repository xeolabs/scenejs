SceneJS_ChunkFactory.createChunkType({

    type: "regionMap",

    build: function () {
        this._uRegionMapSampler = "SCENEJS_uRegionMapSampler";
    },

    pick: function (frameCtx) {

        var regionMap = this.core.regionMap;

        if (regionMap && regionMap.texture) {

            if (this._uRegionMapSampler) {

                this.program.pick.bindTexture(this._uRegionMapSampler, regionMap.texture, frameCtx.textureUnit++);

                if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
                    frameCtx.textureUnit = 0;
                }
            }
        }
    }
});