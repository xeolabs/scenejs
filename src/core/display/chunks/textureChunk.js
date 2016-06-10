SceneJS_ChunkFactory.createChunkType({

    type: "texture",

    build : function() {

        this._uTexSampler = this._uTexSampler || [];
        this._uTexMatrix = this._uTexMatrix || [];
        this._uTexBlendFactor = this._uTexBlendFactor || [];
        
        this._uMegaTextureInfo = this._uMegaTextureInfo || [];
        this._uMegaTextureSampler = this._uMegaTextureSampler || [];

        var layers = this.core.layers;

        if (layers) {

            var layer;
            var draw = this.program.draw;

            for (var i = 0, len = layers.length; i < len; i++) {

                layer = layers[i];

                this._uTexSampler[i] = "SCENEJS_uSampler" + i;

                this._uTexMatrix[i] = draw.getUniform("SCENEJS_uLayer" + i + "Matrix");

                this._uTexBlendFactor[i] = draw.getUniform("SCENEJS_uLayer" + i + "BlendFactor");

                // Virtual texturing

                this._uMegaTextureInfo[i] = draw.getUniform("SCENEJS_uLayer" + i + "MegaTextureInfo");
                this._uMegaTextureSampler[i] = "SCENEJS_uLayer" + i + "MegaTextureSampler";
            }
        }
    },

    draw : function(frameCtx) {

        frameCtx.textureUnit = 0;
        frameCtx.normalMapUVLayerIdx = -1;

        var layers = this.core.layers;

        if (layers) {

            var draw = this.program.draw;
            var layer;

            for (var i = 0, len = layers.length; i < len; i++) {

                layer = layers[i];

                if (this._uTexSampler[i] && layer.texture) {    // Lazy-loads

                    draw.bindTexture(this._uTexSampler[i], layer.texture, frameCtx.textureUnit);
                    frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

                    if (layer._matrixDirty && layer.buildMatrix) {
                        layer.buildMatrix.call(layer);
                    }

                    if (this._uTexMatrix[i]) {
                        this._uTexMatrix[i].setValue(layer.matrixAsArray);
                    }

                    if (this._uTexBlendFactor[i]) {
                        this._uTexBlendFactor[i].setValue(layer.blendFactor);
                    }

                    if (layer.isNormalMap) {

                        // Remember which UV layer we're using for the normal
                        // map so that we can lazy-generate the tangents from the
                        // appropriate UV layer in the geometry chunk.

                        // Note that only one normal map is allowed per drawable, so there
                        // will be only one UV layer used for normal mapping.

                        frameCtx.normalMapUVLayerIdx = layer.uvLayerIdx;
                    }

                    if (layer.megaTexture) {

                        // Megatexturing

                        var megaTexture = layer.megaTexture;
                        var mtTexture = megaTexture.texture;

                        if (mtTexture) { // Lazy-loads
                            
                            if (this._uMegaTextureInfo[i]) {
                                this._uMegaTextureInfo[i].setValue(megaTexture.info);
                            }
                            
                            draw.bindTexture(this._uMegaTextureSampler[i], mtTexture, frameCtx.textureUnit);
                            
                            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

                        }
                    }

                } else {
                     // draw.bindTexture(this._uTexSampler[i], null, i); // Unbind
                }
            }
        }

        frameCtx.texture = this.core;
    }
});