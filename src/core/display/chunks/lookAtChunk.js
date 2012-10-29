/**
 * Create display state chunk type for draw and pick render of lookAt transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "lookAt",

    build : function() {

        this._uvMatrixDraw = this.program.draw.getUniformLocation("SCENEJS_uVMatrix");
        this._uVNMatrixDraw = this.program.draw.getUniformLocation("SCENEJS_uVNMatrix");
        this._uWorldEyeDraw = this.program.draw.getUniformLocation("SCENEJS_uWorldEye");

        this._uvMatrixPick = this.program.pick.getUniformLocation("SCENEJS_uVMatrix");
    },

    draw : function(ctx) {

        if (this.core.dirty) {
            this.core.rebuild();
        }

        var gl = this.program.gl;

        if (this._uvMatrixDraw) {
            gl.uniformMatrix4fv(this._uvMatrixDraw, gl.FALSE, this.core.mat);
        }

        if (this._uVNMatrixDraw) {
            gl.uniformMatrix4fv(this._uVNMatrixDraw, gl.FALSE, this.core.normalMat);
        }

        if (this._uWorldEyeDraw) {
            gl.uniform3fv(this._uWorldEyeDraw, this.core.lookAt.eye);
        }

        ctx.viewMat = this.core.mat;
    },

    pick : function(ctx) {

        var gl = this.program.gl;

        if (this._uvMatrixPick) {
            gl.uniformMatrix4fv(this._uvMatrixPick, gl.FALSE, this.core.mat);
        }

        ctx.viewMat = this.core.mat;
    }
});