SceneJS_ChunkFactory.createChunkType({

    type: "fresnel",

    build: function () {

        var draw = this.program.draw;

        var core = this.core;

        if (core.diffuse) {
            this._uDiffuseFresnelBias = draw.getUniform("SCENEJS_uDiffuseFresnelBias");
            this._uDiffuseFresnelPower = draw.getUniform("SCENEJS_uDiffuseFresnelPower");
            this._uDiffuseFresnelTopColor = draw.getUniform("SCENEJS_uDiffuseFresnelTopColor");
            this._uDiffuseFresnelBottomColor = draw.getUniform("SCENEJS_uDiffuseFresnelBottomColor");
        }

        if (core.specular) {
            this._uSpecularFresnelBias = draw.getUniform("SCENEJS_uSpecularFresnelBias");
            this._uSpecularFresnelPower = draw.getUniform("SCENEJS_uSpecularFresnelPower");
            this._uSpecularFresnelTopColor = draw.getUniform("SCENEJS_uSpecularFresnelTopColor");
            this._uSpecularFresnelBottomColor = draw.getUniform("SCENEJS_uSpecularFresnelBottomColor");
        }

        if (core.alpha) {
            this._uAlphaFresnelBias = draw.getUniform("SCENEJS_uAlphaFresnelBias");
            this._uAlphaFresnelPower = draw.getUniform("SCENEJS_uAlphaFresnelPower");
            this._uAlphaFresnelTopColor = draw.getUniform("SCENEJS_uAlphaFresnelTopColor");
            this._uAlphaFresnelBottomColor = draw.getUniform("SCENEJS_uAlphaFresnelBottomColor");
        }

        if (core.reflect) {
            this._uReflectFresnelBias = draw.getUniform("SCENEJS_uReflectFresnelBias");
            this._uReflectFresnelPower = draw.getUniform("SCENEJS_uReflectFresnelPower");
            this._uReflectFresnelTopColor = draw.getUniform("SCENEJS_uReflectFresnelTopColor");
            this._uReflectFresnelBottomColor = draw.getUniform("SCENEJS_uReflectFresnelBottomColor");
        }
    },

    draw: function () {

        var gl = this.program.gl;

        var core = this.core;

        if (core.diffuse) {
            
            if (this._uDiffuseFresnelBias) {
                this._uDiffuseFresnelBias.setValue(core.diffuse.bias);
            }

            if (this._uDiffuseFresnelPower) {
                this._uDiffuseFresnelPower.setValue(core.diffuse.power);
            }

            if (this._uDiffuseFresnelTopColor) {
                this._uDiffuseFresnelTopColor.setValue(core.diffuse.topColor);
            }

            if (this._uDiffuseFresnelBottomColor) {
                this._uDiffuseFresnelBottomColor.setValue(core.diffuse.bottomColor);
            }
        }

        if (core.specular) {

            if (this._uSpecularFresnelBias) {
                this._uSpecularFresnelBias.setValue(core.specular.bias);
            }

            if (this._uSpecularFresnelPower) {
                this._uSpecularFresnelPower.setValue(core.specular.power);
            }

            if (this._uSpecularFresnelTopColor) {
                this._uSpecularFresnelTopColor.setValue(core.specular.topColor);
            }

            if (this._uSpecularFresnelBottomColor) {
                this._uSpecularFresnelBottomColor.setValue(core.specular.bottomColor);
            }
        }

        if (core.alpha) {

            if (this._uAlphaFresnelBias) {
                this._uAlphaFresnelBias.setValue(core.alpha.bias);
            }

            if (this._uAlphaFresnelPower) {
                this._uAlphaFresnelPower.setValue(core.alpha.power);
            }

            if (this._uAlphaFresnelTopColor) {
                this._uAlphaFresnelTopColor.setValue(core.alpha.topColor);
            }

            if (this._uAlphaFresnelBottomColor) {
                this._uAlphaFresnelBottomColor.setValue(core.alpha.bottomColor);
            }
        }

        if (core.reflect) {

            if (this._uReflectFresnelBias) {
                this._uReflectFresnelBias.setValue(core.reflect.bias);
            }

            if (this._uReflectFresnelPower) {
                this._uReflectFresnelPower.setValue(core.reflect.power);
            }

            if (this._uReflectFresnelTopColor) {
                this._uReflectFresnelTopColor.setValue(core.reflect.topColor);
            }

            if (this._uReflectFresnelBottomColor) {
                this._uReflectFresnelBottomColor.setValue(core.reflect.bottomColor);
            }
        }
    }
});
