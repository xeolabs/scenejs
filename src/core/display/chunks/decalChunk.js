SceneJS_ChunkFactory.createChunkType({

    type: "decal",

    build: function () {

        var draw = this.program.draw;

        this._uDecalSampler = "SCENEJS_uDecalSampler";
        this._uDecalMatrix = draw.getUniform("SCENEJS_uDecalMatrix");
        this._uDecalBlendFactor = draw.getUniform("SCENEJS_uDecalBlendFactor");
    },

    draw: function (frameCtx) {

        // Previous "texture" chunk will have reset frameCtx.textureUnit to zero,
        // then advanced it by however many textures that chunk applied.

        var core = this.core;

        if (this._uDecalSampler && core.texture) {

            var draw = this.program.draw;

            draw.bindTexture(this._uDecalSampler, core.texture, frameCtx.textureUnit);
            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

            if (core._matrixDirty && core.buildMatrix) {
                core.buildMatrix.call(core);
            }

            if (this._uDecalMatrix) {
                this._uDecalMatrix.setValue(core.matrixAsArray);
            }

            if (this._uDecalBlendFactor) {
                this._uDecalBlendFactor.setValue(core.blendFactor);
            }

            frameCtx.decalling = true;

        } else {

            frameCtx.decalling = false;

            // draw.bindTexture(this._uTexSampler[i], null, i); // Unbind
        }
    }
});