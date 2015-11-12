SceneJS_ChunkFactory.createChunkType({

    type: "cubemap",

    build: function () {
        this._uCubeMapSampler = this._uCubeMapSampler || [];
        this._uCubeMapIntensity = this._uCubeMapIntensity || [];
        var layers = this.core.layers;
        if (layers) {
            var layer;
            var draw = this.program.draw;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                this._uCubeMapSampler[i] = "SCENEJS_uCubeMapSampler" + i;
                this._uCubeMapIntensity[i] = draw.getUniform("SCENEJS_uCubeMapIntensity" + i);
            }
        }
    },

    draw: function (frameCtx) {
        var layers = this.core.layers;
        if (layers) {
            var layer;
            var draw = this.program.draw;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                if (this._uCubeMapSampler[i] && layer.texture) {

                    draw.bindTexture(this._uCubeMapSampler[i], layer.texture, frameCtx.textureUnit);
                    frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

                    if (this._uCubeMapIntensity[i]) {
                        this._uCubeMapIntensity[i].setValue(layer.intensity);
                    }
                }
            }
        }
    }
});