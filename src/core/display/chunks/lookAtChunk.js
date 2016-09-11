/**
 * Create display state chunk type for draw and pick render of lookAt transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "lookAt",

    build : function() {

        this._uvMatrixDraw = this.program.draw.getUniform("SCENEJS_uVMatrix");
        this._uVNMatrixDraw = this.program.draw.getUniform("SCENEJS_uVNMatrix");
        this._uWorldEyeDraw = this.program.draw.getUniform("SCENEJS_uWorldEye");

        // for clipping caps
        this._uWorldLookDraw = this.program.draw.getUniform("SCENEJS_uWorldLook");

        this._uvMatrixPick = this.program.pick.getUniform("SCENEJS_uVMatrix");
    },

    draw : function(frameCtx) {

        if (this.core.dirty) {
            this.core.rebuild();
        }

        var gl = this.program.gl;

        if (this._uvMatrixDraw) {
            this._uvMatrixDraw.setValue(this.core.mat);
        }

        if (this._uVNMatrixDraw) {
            this._uVNMatrixDraw.setValue(this.core.normalMat);
        }

        if (this._uWorldEyeDraw) {
            this._uWorldEyeDraw.setValue(this.core.lookAt.eye);
        }

        if (this._uWorldLookDraw) {
            this._uWorldLookDraw.setValue(this.core.lookAt.look);
        }

        frameCtx.viewMat = this.core.mat;
    },

    pick : function(frameCtx) {
        
        if (this._uvMatrixPick) {
            this._uvMatrixPick.setValue(frameCtx.pickMatrix || this.core.mat);
        }

        frameCtx.viewMat = this.core.mat;
    }
});