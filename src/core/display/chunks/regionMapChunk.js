SceneJS_ChunkFactory.createChunkType({

    type: "regionMap",

    build: function () {
        this._uRegionMapHighlightColor = this.program.draw.getUniform("SCENEJS_uRegionMapHighlightColor");
        this._uRegionMapHighlightFactor = this.program.draw.getUniform("SCENEJS_uRegionMapHighlightFactor");
        this._uRegionMapSampler = "SCENEJS_uRegionMapSampler";
    },

    draw: function (frameCtx) {

        var texture = this.core.texture;

        if (texture) {

            this.program.draw.bindTexture(this._uRegionMapSampler, texture, frameCtx.textureUnit++);

            if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
                frameCtx.textureUnit = 0;
            }
        }

        if (this._uRegionMapHighlightColor) {
            this._uRegionMapHighlightColor.setValue(this.core.highlightColor);
        }

        if (this._uRegionMapHighlightFactor) {
            this._uRegionMapHighlightFactor.setValue(this.core.highlightFactor);
        }
    },

    pick: function (frameCtx) {

        var texture = this.core.texture;

        if (texture) {

            frameCtx.regionData = this.core.regionData;

            frameCtx.textureUnit = 0;

            this.program.pick.bindTexture(this._uRegionMapSampler, texture, frameCtx.textureUnit++);

            if (frameCtx.textureUnit > 10) { // TODO: Find how many textures allowed
                frameCtx.textureUnit = 0;
            }
        }
    }
});