/**
 *  Create display state chunk type for draw and pick render of flags
 */
SceneJS_ChunkFactory.createChunkType({

    type: "flags",

    build: function () {

        var draw = this.program.draw;

        this._uClippingDraw = draw.getUniformLocation("SCENEJS_uClipping");

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
            if (!frameCtx.pick) {
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
            }
            frameCtx.transparent = transparent;
        }

        if (frameCtx.pick) {
            gl.uniform1i(this._uClippingPick, this.core.clipping);

        } else {
            var drawUniforms = (this.core.clipping ? 1 : 0);
            if (this.program.drawUniformFlags != drawUniforms) {
                gl.uniform1i(this._uClippingDraw, this.core.clipping);
                this.program.drawUniformFlags = drawUniforms;
            }
        }
    }
});
