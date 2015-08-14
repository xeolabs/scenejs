SceneJS_ChunkFactory.createChunkType({

    type: "fresnel",

    build: function () {

        var draw = this.program.draw;

        var core = this.core;

        if (core.diffuse) {
            this._uDiffuseFresnelCenterBias = draw.getUniform("SCENEJS_uDiffuseFresnelCenterBias");
            this._uDiffuseFresnelEdgeBias = draw.getUniform("SCENEJS_uDiffuseFresnelEdgeBias");
            this._uDiffuseFresnelPower = draw.getUniform("SCENEJS_uDiffuseFresnelPower");
            this._uDiffuseFresnelCenterColor = draw.getUniform("SCENEJS_uDiffuseFresnelCenterColor");
            this._uDiffuseFresnelEdgeColor = draw.getUniform("SCENEJS_uDiffuseFresnelEdgeColor");
        }

        if (core.specular) {
            this._uSpecularFresnelCenterBias = draw.getUniform("SCENEJS_uSpecularFresnelCenterBias");
            this._uSpecularFresnelEdgeBias = draw.getUniform("SCENEJS_uSpecularFresnelEdgeBias");
            this._uSpecularFresnelPower = draw.getUniform("SCENEJS_uSpecularFresnelPower");
            this._uSpecularFresnelCenterColor = draw.getUniform("SCENEJS_uSpecularFresnelCenterColor");
            this._uSpecularFresnelEdgeColor = draw.getUniform("SCENEJS_uSpecularFresnelEdgeColor");
        }

        if (core.alpha) {
            this._uAlphaFresnelCenterBias = draw.getUniform("SCENEJS_uAlphaFresnelCenterBias");
            this._uAlphaFresnelEdgeBias = draw.getUniform("SCENEJS_uAlphaFresnelEdgeBias");
            this._uAlphaFresnelPower = draw.getUniform("SCENEJS_uAlphaFresnelPower");
            this._uAlphaFresnelCenterColor = draw.getUniform("SCENEJS_uAlphaFresnelCenterColor");
            this._uAlphaFresnelEdgeColor = draw.getUniform("SCENEJS_uAlphaFresnelEdgeColor");
        }

        if (core.reflect) {
            this._uReflectFresnelCenterBias = draw.getUniform("SCENEJS_uReflectFresnelCenterBias");
            this._uReflectFresnelEdgeBias = draw.getUniform("SCENEJS_uReflectFresnelEdgeBias");
            this._uReflectFresnelPower = draw.getUniform("SCENEJS_uReflectFresnelPower");
            this._uReflectFresnelCenterColor = draw.getUniform("SCENEJS_uReflectFresnelCenterColor");
            this._uReflectFresnelEdgeColor = draw.getUniform("SCENEJS_uReflectFresnelEdgeColor");
        }

        if (core.emit) {
            this._uEmitFresnelCenterBias = draw.getUniform("SCENEJS_uEmitFresnelCenterBias");
            this._uEmitFresnelEdgeBias = draw.getUniform("SCENEJS_uEmitFresnelEdgeBias");
            this._uEmitFresnelPower = draw.getUniform("SCENEJS_uEmitFresnelPower");
            this._uEmitFresnelCenterColor = draw.getUniform("SCENEJS_uEmitFresnelCenterColor");
            this._uEmitFresnelEdgeColor = draw.getUniform("SCENEJS_uEmitFresnelEdgeColor");
        }

        if (core.fragment) {
            this._uFragmentFresnelCenterBias = draw.getUniform("SCENEJS_uFragmentFresnelCenterBias");
            this._uFragmentFresnelEdgeBias = draw.getUniform("SCENEJS_uFragmentFresnelEdgeBias");
            this._uFragmentFresnelPower = draw.getUniform("SCENEJS_uFragmentFresnelPower");
            this._uFragmentFresnelCenterColor = draw.getUniform("SCENEJS_uFragmentFresnelCenterColor");
            this._uFragmentFresnelEdgeColor = draw.getUniform("SCENEJS_uFragmentFresnelEdgeColor");
        }
    },

    draw: function () {

        var gl = this.program.gl;

        var core = this.core;

        if (core.diffuse) {
            
            if (this._uDiffuseFresnelCenterBias) {
                this._uDiffuseFresnelCenterBias.setValue(core.diffuse.centerBias);
            }

            if (this._uDiffuseFresnelEdgeBias) {
                this._uDiffuseFresnelEdgeBias.setValue(core.diffuse.edgeBias);
            }

            if (this._uDiffuseFresnelPower) {
                this._uDiffuseFresnelPower.setValue(core.diffuse.power);
            }

            if (this._uDiffuseFresnelCenterColor) {
                this._uDiffuseFresnelCenterColor.setValue(core.diffuse.centerColor);
            }

            if (this._uDiffuseFresnelEdgeColor) {
                this._uDiffuseFresnelEdgeColor.setValue(core.diffuse.edgeColor);
            }
        }

        if (core.specular) {

            if (this._uSpecularFresnelCenterBias) {
                this._uSpecularFresnelCenterBias.setValue(core.specular.centerBias);
            }

            if (this._uSpecularFresnelEdgeBias) {
                this._uSpecularFresnelEdgeBias.setValue(core.specular.edgeBias);
            }

            if (this._uSpecularFresnelPower) {
                this._uSpecularFresnelPower.setValue(core.specular.power);
            }

            if (this._uSpecularFresnelCenterColor) {
                this._uSpecularFresnelCenterColor.setValue(core.specular.centerColor);
            }

            if (this._uSpecularFresnelEdgeColor) {
                this._uSpecularFresnelEdgeColor.setValue(core.specular.edgeColor);
            }
        }

        if (core.alpha) {

            if (this._uAlphaFresnelCenterBias) {
                this._uAlphaFresnelCenterBias.setValue(core.alpha.centerBias);
            }

            if (this._uAlphaFresnelEdgeBias) {
                this._uAlphaFresnelEdgeBias.setValue(core.alpha.edgeBias);
            }

            if (this._uAlphaFresnelPower) {
                this._uAlphaFresnelPower.setValue(core.alpha.power);
            }

            if (this._uAlphaFresnelCenterColor) {
                this._uAlphaFresnelCenterColor.setValue(core.alpha.centerColor);
            }

            if (this._uAlphaFresnelEdgeColor) {
                this._uAlphaFresnelEdgeColor.setValue(core.alpha.edgeColor);
            }
        }

        if (core.reflect) {

            if (this._uReflectFresnelCenterBias) {
                this._uReflectFresnelCenterBias.setValue(core.reflect.centerBias);
            }

            if (this._uReflectFresnelEdgeBias) {
                this._uReflectFresnelEdgeBias.setValue(core.reflect.edgeBias);
            }

            if (this._uReflectFresnelPower) {
                this._uReflectFresnelPower.setValue(core.reflect.power);
            }

            if (this._uReflectFresnelCenterColor) {
                this._uReflectFresnelCenterColor.setValue(core.reflect.centerColor);
            }

            if (this._uReflectFresnelEdgeColor) {
                this._uReflectFresnelEdgeColor.setValue(core.reflect.edgeColor);
            }
        }

        if (core.emit) {

            if (this._uEmitFresnelCenterBias) {
                this._uEmitFresnelCenterBias.setValue(core.emit.centerBias);
            }

            if (this._uEmitFresnelEdgeBias) {
                this._uEmitFresnelEdgeBias.setValue(core.emit.edgeBias);
            }

            if (this._uEmitFresnelPower) {
                this._uEmitFresnelPower.setValue(core.emit.power);
            }

            if (this._uEmitFresnelCenterColor) {
                this._uEmitFresnelCenterColor.setValue(core.emit.centerColor);
            }

            if (this._uEmitFresnelEdgeColor) {
                this._uEmitFresnelEdgeColor.setValue(core.emit.edgeColor);
            }
        }

        if (core.fragment) {

            if (this._uFragmentFresnelCenterBias) {
                this._uFragmentFresnelCenterBias.setValue(core.fragment.centerBias);
            }

            if (this._uFragmentFresnelEdgeBias) {
                this._uFragmentFresnelEdgeBias.setValue(core.fragment.edgeBias);
            }

            if (this._uFragmentFresnelPower) {
                this._uFragmentFresnelPower.setValue(core.fragment.power);
            }

            if (this._uFragmentFresnelCenterColor) {
                this._uFragmentFresnelCenterColor.setValue(core.fragment.centerColor);
            }

            if (this._uFragmentFresnelEdgeColor) {
                this._uFragmentFresnelEdgeColor.setValue(core.fragment.edgeColor);
            }
        }
    }
});
