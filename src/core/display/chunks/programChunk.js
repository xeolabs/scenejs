SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build : function() {

        // Note that "program" chunks are always after "renderTarget" chunks
        this._depthModeDraw = this.program.draw.getUniform("SCENEJS_uDepthMode");
        this._depthModePick = this.program.pick.getUniform("SCENEJS_uDepthMode");
        this._pickMode = this.program.pick.getUniform("SCENEJS_uPickMode");
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

        // Set the picking mode

        if (frameCtx.rayPick) {
            this._pickMode.setValue(1.0);
        } else if (frameCtx.regionPick) {
            this._pickMode.setValue(2.0);
        } else {
            this._pickMode.setValue(0.0);
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



