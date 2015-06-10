SceneJS_ChunkFactory.createChunkType({

    type: "camera",

    build : function() {

        this._uPMatrixDraw = this.program.draw.getUniform("SCENEJS_uPMatrix");
        this._uZNearDraw = this.program.draw.getUniform("SCENEJS_uZNear");
        this._uZFarDraw = this.program.draw.getUniform("SCENEJS_uZFar");

        this._uPMatrixPick = this.program.pick.getUniform("SCENEJS_uPMatrix");
        this._uZNearPick = this.program.pick.getUniform("SCENEJS_uZNear");
        this._uZFarPick = this.program.pick.getUniform("SCENEJS_uZFar");
    },

    draw : function(frameCtx) {

        if (this.core.checkAspect) {
            this.core.checkAspect(this.core, frameCtx.aspect);
        }

        var gl = this.program.gl;

        if (this._uPMatrixDraw) {
            this._uPMatrixDraw.setValue(this.core.mat);
        }

        if (this._uZNearDraw) {
            this._uZNearDraw.setValue(this.core.optics.near);
        }

        if (this._uZFarDraw) {
            this._uZFarDraw.setValue(this.core.optics.far);
        }

        frameCtx.cameraMat = this.core.mat; // Query only in draw pass
    },


    pick : function(frameCtx) {

        if (this.core.checkAspect) {
            this.core.checkAspect(this.core, frameCtx.aspect);
        }

        var gl = this.program.gl;

        if (this._uPMatrixPick) {
            this._uPMatrixPick.setValue(this.core.mat);
        }

        if (frameCtx.rayPick) { // Z-pick pass: feed near and far clip planes into shader

            if (this._uZNearPick) {
                this._uZNearPick.setValue(this.core.optics.near);
            }

            if (this._uZFarPick) {
                this._uZFarPick.setValue(this.core.optics.far);
            }
        }

        frameCtx.cameraMat = this.core.mat; // Query only in draw pass
    }
});