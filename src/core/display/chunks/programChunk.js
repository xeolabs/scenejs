SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build: function () {

        // Note that "program" chunks are always after "renderTarget" chunks
        this._depthModeDraw = this.program.draw.getUniform("SCENEJS_uDepthMode");
        this._pickMode = this.program.pick.getUniform("SCENEJS_uPickMode");
    },

    draw: function (frameCtx) {
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
        frameCtx.useProgram++;
    },

    pick: function (frameCtx) {

        var pickProgram = this.program.pick;
        pickProgram.bind();

        var gl = this.program.gl;

        // Set the picking mode

        if (frameCtx.pickObject) {
            this._pickMode.setValue(0.0); // Pick object

        } else if (frameCtx.pickTriangle) {
            this._pickMode.setValue(1.0);// Pick triangle

        } else {
            this._pickMode.setValue(2.0); // Pick region
        }

        frameCtx.textureUnit = 0;

        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
});



