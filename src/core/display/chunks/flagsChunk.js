/**
 *  Create display state chunk type for draw and pick render of flags
 */
SceneJS_ChunkFactory.createChunkType({

    type: "flags",

    build: function () {

        var draw = this.program.draw;

        this._uClippingDraw = draw.getUniform("SCENEJS_uClipping");
        this._uSolidDraw = draw.getUniform("SCENEJS_uSolid");
        this._uSolidColorDraw = draw.getUniform("SCENEJS_uSolidColor");

        var pick = this.program.pick;

        this._uClippingPick = pick.getUniform("SCENEJS_uClipping");
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

        var picking = frameCtx.picking;

        if (picking) {

            if (this._uClippingPick) {
                this._uClippingPick.setValue(this.core.clipping);
            }

        } else {

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

            if (this._uClippingDraw) {
                this._uClippingDraw.setValue(this.core.clipping);
            }

            if (this._uSolidDraw) {
                this._uSolidDraw.setValue(this.core.solid);
            }

            if (this._uSolidColorDraw) {
                this._uSolidColorDraw.setValue(this.core.solidColor);
            }
        }
    }
});
