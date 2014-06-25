SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build : function() {
        this._rayPickMode = this.program.pick.getUniformLocation("SCENEJS_uRayPickMode");
    },

    draw : function(frameCtx) {

        var drawProgram = this.program.draw;

        drawProgram.bind();

        frameCtx.textureUnit = 0;

        var gl = this.program.gl;

        if (frameCtx.VAO) {
            frameCtx.VAO.bindVertexArrayOES(null);
        }

        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    },

    pick : function(frameCtx) {

        var pickProgram = this.program.pick;

        pickProgram.bind();

        var gl = this.program.gl;

        gl.uniform1i(this._rayPickMode, frameCtx.rayPick);

        frameCtx.textureUnit = 0;

        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
});



