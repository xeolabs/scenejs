/**
 * Create display state chunk type for draw render of material transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "material",

    build : function() {

        var draw = this.program.draw;

        this._uMaterialBaseColor = draw.getUniformLocation("SCENEJS_uMaterialBaseColor");
        this._uMaterialSpecularColor = draw.getUniformLocation("SCENEJS_uMaterialSpecularColor");
        this._uMaterialSpecular = draw.getUniformLocation("SCENEJS_uMaterialSpecular");
        this._uMaterialShine = draw.getUniformLocation("SCENEJS_uMaterialShine");
        this._uMaterialEmit = draw.getUniformLocation("SCENEJS_uMaterialEmit");
        this._uMaterialAlpha = draw.getUniformLocation("SCENEJS_uMaterialAlpha");
    },

    draw : function() {

        var gl = this.program.gl;

        if (this._uMaterialBaseColor) {
            gl.uniform3fv(this._uMaterialBaseColor, this.core.baseColor);
        }

        if (this._uMaterialSpecularColor) {
            gl.uniform3fv(this._uMaterialSpecularColor, this.core.specularColor);
        }

        if (this._uMaterialSpecular) {
            gl.uniform1f(this._uMaterialSpecular, this.core.specular);
        }

        if (this._uMaterialShine) {
            gl.uniform1f(this._uMaterialShine, this.core.shine);
        }

        if (this._uMaterialEmit) {
            gl.uniform1f(this._uMaterialEmit, this.core.emit);
        }

        if (this._uMaterialAlpha) {
            gl.uniform1f(this._uMaterialAlpha, this.core.alpha);
        }
    }
});