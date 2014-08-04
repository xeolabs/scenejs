/**
 *  Create display state chunk type for draw and pick render of flags
 */
SceneJS_ChunkFactory.createChunkType({

    type: "flags",

    build: function () {

        var draw = this.program.draw;

        this._uBackfaceTexturingDraw = draw.getUniformLocation("SCENEJS_uBackfaceTexturing");
        this._uBackfaceLightingDraw = draw.getUniformLocation("SCENEJS_uBackfaceLighting");
        this._uSpecularLightingDraw = draw.getUniformLocation("SCENEJS_uSpecularLighting");
        this._uClippingDraw = draw.getUniformLocation("SCENEJS_uClipping");
        this._uAmbientDraw = draw.getUniformLocation("SCENEJS_uAmbient");
        this._uDiffuseDraw = draw.getUniformLocation("SCENEJS_uDiffuse");
        this._uReflectionDraw = draw.getUniformLocation("SCENEJS_uReflection");

        var pick = this.program.pick;

        this._uClippingPick = pick.getUniformLocation("SCENEJS_uClipping");
    },

    drawAndPick: function (frameCtx) {

        var gl = this.program.gl;

        var backfaces = this.core.backfaces;

        if (frameCtx.backfaces != backfaces) {
            if (backfaces) {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
            }
            frameCtx.backfaces = backfaces;
        }

        var frontface = this.core.frontface;

        if (frameCtx.frontface != frontface) {
            if (frontface == "ccw") {
                gl.frontFace(gl.CCW);
            } else {
                gl.frontFace(gl.CW);
            }
            frameCtx.frontface = frontface;
        }

        var transparent = this.core.transparent;

        if (frameCtx.transparent != transparent) {
            if (transparent) {

                // Entering a transparency bin

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                frameCtx.blendEnabled = true;

            } else {

                // Leaving a transparency bin

                gl.disable(gl.BLEND);
                frameCtx.blendEnabled = false;
            }
            frameCtx.transparent = transparent;
        }

        if (frameCtx.pick) {
            gl.uniform1i(this._uClippingPick, this.core.clipping);

        } else {
            var drawUniforms = (this.core.backfaceTexturing ? 1 : 0) +
                (this.core.backfaceLighting ? 2 : 0) +
                (this.core.specular ? 4 : 0) +
                (this.core.clipping ? 8 : 0) +
                (this.core.ambient ? 16 : 0) +
                (this.core.diffuse ? 32 : 0) +
                (this.core.reflection ? 64 : 0);
            if (this.program.drawUniformFlags != drawUniforms) {
                gl.uniform1i(this._uBackfaceTexturingDraw, this.core.backfaceTexturing);
                gl.uniform1i(this._uBackfaceLightingDraw, this.core.backfaceLighting);
                gl.uniform1i(this._uSpecularLightingDraw, this.core.specular);
                gl.uniform1i(this._uClippingDraw, this.core.clipping);
                gl.uniform1i(this._uAmbientDraw, this.core.ambient);
                gl.uniform1i(this._uDiffuseDraw, this.core.diffuse);
                gl.uniform1i(this._uReflectionDraw, this.core.reflection);
                this.program.drawUniformFlags = drawUniforms;
            }
        }
    }
});
