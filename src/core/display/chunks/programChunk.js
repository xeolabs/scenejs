SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build : function() {
        this._rayPickMode = this.program.pick.getUniformLocation("SCENEJS_uRayPickMode");
    },

    draw : function(frameCtx) {

        var drawProgram = this.program.draw;

        if (frameCtx.program) {
            frameCtx.program.unbind();
        }

        drawProgram.bind();

        frameCtx.program = drawProgram;

        /*
         * HACK until we have distinct chunk for each VBO (maybe)
         */
        frameCtx.vertexBuf = false;
        frameCtx.normalBuf = false;
        frameCtx.uvBuf = false;
        frameCtx.uvBuf2 = false;
        frameCtx.colorBuf = false;

        frameCtx.geoChunkId = null; // HACK until we have distinct state chunks for VBOs and draw call
    },

    pick : function(frameCtx) {

        var pickProgram = this.program.pick;

        if (frameCtx.program) {
            frameCtx.program.unbind();
        }

        pickProgram.bind();

        this.program.gl.uniform1i(this._rayPickMode, frameCtx.rayPick);

        frameCtx.program = pickProgram;

        /*
        * HACK until we have distinct chunk for each VBO (maybe)
         */
        frameCtx.vertexBuf = false;
        frameCtx.normalBuf = false;
        frameCtx.uvBuf = false;
        frameCtx.uvBuf2 = false;
        frameCtx.colorBuf = false;

        frameCtx.geoChunkId = null; // HACK until we have distinct state chunks for VBOs and draw call

    }
});



