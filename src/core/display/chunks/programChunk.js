SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build : function() {

        // Note that "program" chunks are always after "renderTarget" chunks
        this._depthModeDraw = this.program.draw.getUniform("SCENEJS_uDepthMode");
        this._depthModePick = this.program.pick.getUniform("SCENEJS_uDepthMode");
        this._rayPickMode = this.program.pick.getUniform("SCENEJS_uRayPickMode");
    },

    draw : function(frameCtx) {
        var drawProgram = this.program.draw;
        drawProgram.bind();
        frameCtx.textureUnit = 0;
        var gl = this.program.gl;
        if (this._depthModeDraw) {
            this._depthModeDraw.setValue(frameCtx.depthMode);
        }
        if (!frameCtx.VAO) {
            for (var i = 0; i < 10; i++) {
                gl.disableVertexAttribArray(i);
            }
        }

        frameCtx.drawProgram = this.program.draw;
    },

    pick : function(frameCtx) {
        var pickProgram = this.program.pick;
        pickProgram.bind();
        var gl = this.program.gl;
        if (this._rayPickMode) {
            this._rayPickMode.setValue(frameCtx.rayPick);
        }
        if (this._depthModePick) {
            this._depthModePick.setValue(frameCtx.depthMode);
        }
        frameCtx.textureUnit = 0;
        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
});



