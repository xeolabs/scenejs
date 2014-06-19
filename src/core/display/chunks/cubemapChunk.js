SceneJS_ChunkFactory.createChunkType({

    type: "cubemap",

    build: function () {
        this._uCubeMapSampler = this._uCubeMapSampler || [];
        this._uCubeMapBlendFactor = this._uCubeMapBlendFactor || [];
        var layers = this.core.layers;
        if (layers) {
            var layer;
            var draw = this.program.draw;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                this._uCubeMapSampler[i] = "SCENEJS_uCubeMapSampler" + i;
                this._uCubeMapBlendFactor[i] = draw.getUniform("SCENEJS_uCubeMapBlendFactor" + i);
            }
        }
    },

    draw: function (ctx) {
        if (this.core.layers) {
            var layers = this.core.layers;
            if (layers) {
                var layer;
                var draw = this.program.draw;
                for (var i = 0, len = layers.length; i < len; i++) {
                    layer = layers[i];
                    if (this._uCubeMapSampler[i] && layer.texture) {
                        draw.bindTexture(this._uCubeMapSampler[i], layer.texture, ctx.textureUnit++);
                        if (this._uCubeMapBlendFactor[i]) {
                            this._uCubeMapBlendFactor[i].setValue(layer.blendFactor);
                        }
                    }
                }
            }
        }
    }
});