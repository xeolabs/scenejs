SceneJS_ChunkFactory.createChunkType({

    type: "material",

    build: function () {

        var draw = this.program.draw;

        this._uMaterialBaseColor = draw.getUniform("SCENEJS_uMaterialColor");
        this._uMaterialSpecularColor = draw.getUniform("SCENEJS_uMaterialSpecularColor");
        this._uMaterialEmitColor = draw.getUniform("SCENEJS_uMaterialEmitColor");

        this._uMaterialSpecular = draw.getUniform("SCENEJS_uMaterialSpecular");
        this._uMaterialShine = draw.getUniform("SCENEJS_uMaterialShine");
        this._uMaterialEmit = draw.getUniform("SCENEJS_uMaterialEmit");

        this._uMaterialAlpha = draw.getUniform("SCENEJS_uMaterialAlpha");
    },

    draw: function () {

        var gl = this.program.gl;

        if (this._uMaterialBaseColor) {
            this._uMaterialBaseColor.setValue(this.core.baseColor);
        }

        if (this._uMaterialSpecularColor) {
            this._uMaterialSpecularColor.setValue(this.core.specularColor);
        }

        if (this._uMaterialEmitColor) {
            this._uMaterialEmitColor.setValue(this.core.emitColor);
        }

        if (this._uMaterialSpecular) {
            this._uMaterialSpecular.setValue(this.core.specular);
        }

        if (this._uMaterialShine) {
            this._uMaterialShine.setValue(this.core.shine);
        }

        if (this._uMaterialEmit) {
            this._uMaterialEmit.setValue(this.core.emit);
        }

        if (this._uMaterialAlpha) {
            this._uMaterialAlpha.setValue(this.core.alpha);
        }
    }
});
