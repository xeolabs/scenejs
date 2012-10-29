SceneJS_ChunkFactory.createChunkType({

    type: "xform",

    build : function() {

        var draw = this.program.draw;

        this._uMatLocationDraw = draw.getUniformLocation("SCENEJS_uMMatrix");
        this._uNormalMatLocationDraw = draw.getUniformLocation("SCENEJS_uMNMatrix");

        var pick = this.program.pick;

        this._uMatLocationPick = pick.getUniformLocation("SCENEJS_uMMatrix");
        this._uNormalMatLocationPick = pick.getUniformLocation("SCENEJS_uMNMatrix");
    },

    draw : function(ctx) {

        /* Rebuild core's matrix from matrices at cores on path up to root
         */
       if (this.core.dirty && this.core.build) {
            this.core.build();
        }

        var gl = this.program.gl;

        if (this._uMatLocationDraw) {
            gl.uniformMatrix4fv(this._uMatLocationDraw, gl.FALSE, this.core.mat);
        }

        if (this._uNormalMatLocationDraw) {
            gl.uniformMatrix4fv(this._uNormalMatLocationDraw, gl.FALSE, this.core.normalMat);
        }

        ctx.modelMat = this.core.mat;
    },

    pick : function(ctx) {

        /* Rebuild core's matrix from matrices at cores on path up to root
         */
        if (this.core.dirty) {
            this.core.build();
        }

        var gl = this.program.gl;

        if (this._uMatLocationPick) {
            gl.uniformMatrix4fv(this._uMatLocationPick, gl.FALSE, this.core.mat);
        }

        if (this._uNormalMatLocationPick) {
            gl.uniformMatrix4fv(this._uNormalMatLocationPick, gl.FALSE, this.core.normalMat);
        }

        ctx.modelMat = this.core.mat;
    }
});
