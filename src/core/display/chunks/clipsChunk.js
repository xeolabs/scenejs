/**
 * Create display state chunk type for draw and pick render of user clipping planes
 */
SceneJS_ChunkFactory.createChunkType({

    type: "clips",

    build : function() {

        this._draw = this._draw || [];

        var draw = this.program.draw;

        for (var i = 0, len = this.core.clips.length; i < len; i++) {
            this._draw[i] = {
                uClipMode :draw.getUniform("SCENEJS_uClipMode" + i),
                uClipNormalAndDist: draw.getUniform("SCENEJS_uClipNormalAndDist" + i)
            };
        }

        this._pick = this._pick || [];

        var pick = this.program.pick;

        for (var i = 0, len = this.core.clips.length; i < len; i++) {
            this._pick[i] = {
                uClipMode :pick.getUniform("SCENEJS_uClipMode" + i),
                uClipNormalAndDist: pick.getUniform("SCENEJS_uClipNormalAndDist" + i)
            };
        }
    },

    drawAndPick: function(frameCtx) {

        var picking = frameCtx.picking;
        var vars = picking ? this._pick : this._draw;
        var mode;
        var normalAndDist;
        var clips = this.core.clips;
        var clip;
        var gl = this.program.gl;

        for (var i = 0, len = clips.length; i < len; i++) {

            if (picking) {
                mode = vars[i].uClipMode;
                normalAndDist = vars[i].uClipNormalAndDist;
            } else {
                mode = vars[i].uClipMode;
                normalAndDist = vars[i].uClipNormalAndDist;
            }

            if (mode && normalAndDist) {

                clip = clips[i];

                if (clip.mode == "inside") {

                    mode.setValue(2);
                    normalAndDist.setValue(clip.normalAndDist);

                } else if (clip.mode == "outside") {

                    mode.setValue(1);
                    normalAndDist.setValue(clip.normalAndDist);

                } else { // disabled
                    mode.setValue(0);
                }
            }
        }
    }
});