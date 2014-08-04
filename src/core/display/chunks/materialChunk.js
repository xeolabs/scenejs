/**
 * Create display state chunk type for draw render of material transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "material",

    build : function() {

        var draw = this.program.draw;

        this._uMaterialBaseColor = draw.getUniformLocation("SCENEJS_uMaterialColor");
        this._uMaterialSpecularColor = draw.getUniformLocation("SCENEJS_uMaterialSpecularColor");
        this._uMaterialSpecular = draw.getUniformLocation("SCENEJS_uMaterialSpecular");
        this._uMaterialShine = draw.getUniformLocation("SCENEJS_uMaterialShine");
        this._uMaterialEmit = draw.getUniformLocation("SCENEJS_uMaterialEmit");
        this._uMaterialAlpha = draw.getUniformLocation("SCENEJS_uMaterialAlpha");
    },

    draw : function() {

        var gl = this.program.gl;
        var materialSettings = this.program.draw.materialSettings;

        if (this._uMaterialBaseColor) {
            gl.uniform3fv(this._uMaterialBaseColor, this.core.baseColor);
        }

        if (this._uMaterialSpecularColor &&
            (materialSettings.specularColor[0] != this.core.specularColor[0] ||
             materialSettings.specularColor[1] != this.core.specularColor[1] ||
             materialSettings.specularColor[2] != this.core.specularColor[2])) {
            gl.uniform3fv(this._uMaterialSpecularColor, this.core.specularColor);
            materialSettings.specularColor[0] = this.core.specularColor[0];
            materialSettings.specularColor[1] = this.core.specularColor[1];
            materialSettings.specularColor[2] = this.core.specularColor[2];
        }

        if (this._uMaterialSpecular && materialSettings.specular != this.core.specular) {
            gl.uniform1f(this._uMaterialSpecular, this.core.specular);
            materialSettings.specular = this.core.specular;
        }

        if (this._uMaterialShine && materialSettings.shine != this.core.shine) {
            gl.uniform1f(this._uMaterialShine, this.core.shine);
            materialSettings.shine = this.core.shine;
        }

        if (this._uMaterialEmit && materialSettings.emit != this.core.emit) {
            gl.uniform1f(this._uMaterialEmit, this.core.emit);
            materialSettings.emit = this.core.emit;
        }

        if (this._uMaterialAlpha && materialSettings.alpha != this.core.alpha) {
            gl.uniform1f(this._uMaterialAlpha, this.core.alpha);
            materialSettings.alpha = this.core.alpha;
        }
    }
});
