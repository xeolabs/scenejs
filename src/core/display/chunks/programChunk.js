SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build : function() {
        this._rayPickMode = this.program.pick.getUniformLocation("SCENEJS_uRayPickMode");
    },

    draw : function(frameCtx) {

        var drawProgram = this.program.draw;

        drawProgram.bind();

        /*
         * HACK until we have distinct chunk for each VBO (maybe)
         */
        frameCtx.vertexBuf = false;
        frameCtx.normalBuf = false;
        frameCtx.uvBuf = false;
        frameCtx.uvBuf2 = false;
        frameCtx.colorBuf = false;
        frameCtx.textureUnit = 0;

        frameCtx.geoChunkId = null; // HACK until we have distinct state chunks for VBOs and draw call

        var gl = this.program.gl;

        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    },

    pick : function(frameCtx) {

        var pickProgram = this.program.pick;

        pickProgram.bind();

        var gl = this.program.gl;

        gl.uniform1i(this._rayPickMode, frameCtx.rayPick);

        /*
        * HACK until we have distinct chunk for each VBO (maybe)
         */
        frameCtx.vertexBuf = false;
        frameCtx.normalBuf = false;
        frameCtx.uvBuf = false;
        frameCtx.uvBuf2 = false;
        frameCtx.colorBuf = false;
        frameCtx.textureUnit = 0;

        frameCtx.geoChunkId = null; // HACK until we have distinct state chunks for VBOs and draw call

        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
});



