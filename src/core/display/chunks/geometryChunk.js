/**
 *  Create display state chunk type for draw and pick render of geometry
 */
SceneJS_ChunkFactory.createChunkType({

    type:"geometry",

    /**
     * As we apply a list of state chunks in a {@link SceneJS_Display}, we track the ID of each chunk
     * in order to avoid redundantly re-applying the same chunk.
     *
     * We don't want that for draw chunks however, because they contain GL drawElements calls,
     * which we need to do for each object.
     */
    unique:true,

    build:function () {

        var draw = this.program.draw;

        this._aVertexDraw = draw.getAttribute("SCENEJS_aVertex");
        this._aNormalDraw = draw.getAttribute("SCENEJS_aNormal");
        this._aUVDraw = draw.getAttribute("SCENEJS_aUVCoord");
        this._aUV2Draw = draw.getAttribute("SCENEJS_aUVCoord2");
        this._aColorDraw = draw.getAttribute("SCENEJS_aVertexColor");

        var pick = this.program.pick;

        this._aVertexPick = pick.getAttribute("SCENEJS_aVertex");
        this._aNormalPick = pick.getAttribute("SCENEJS_aNormal");
        this._aUVPick = pick.getAttribute("SCENEJS_aUVCoord");
        this._aUV2Pick = pick.getAttribute("SCENEJS_aUVCoord2");
        this._aColorPick = pick.getAttribute("SCENEJS_aVertexColor");
    },

    draw:function (ctx) {

        var gl = this.program.gl;

        if (ctx.geoChunkId != this.id) { // HACK until we have distinct state chunks for VBOs and draw call

            if (this._aVertexDraw && !ctx.vertexBuf) {
                this._aVertexDraw.bindFloatArrayBuffer(this.core.vertexBuf);
            }

            if (this._aNormalDraw && !ctx.normalBuf) {
                this._aNormalDraw.bindFloatArrayBuffer(this.core.normalBuf);
            }

            if (this._aUVDraw && !ctx.uvBuf) {
                this._aUVDraw.bindFloatArrayBuffer(this.core.uvBuf);
            }

            if (this._aUV2Draw && !ctx.uvBuf2) {
                this._aUV2Draw.bindFloatArrayBuffer(this.core.uvBuf2);
            }

            if (this._aColorDraw && !ctx.colorBuf) {
                this._aColorDraw.bindFloatArrayBuffer(this.core.colorBuf);
            }

            this.core.indexBuf.bind();

            ctx.geoChunkId = this.id;
        }

        gl.drawElements(this.core.primitive, this.core.indexBuf.numItems, gl.UNSIGNED_SHORT, 0);
    },

    pick:function (ctx) {

        var gl = this.program.gl;

        if (ctx.geoChunkId != this.id) { // HACK until we have distinct state chunks for VBOs and draw call

            if (this._aVertexPick && !ctx.vertexBuf) {
                this._aVertexPick.bindFloatArrayBuffer(this.core.vertexBuf);
            }

            if (this._aNormalPick && !ctx.normalBuf) {
                this._aNormalPick.bindFloatArrayBuffer(this.core.normalBuf);
            }

            if (this._aUVPick && !ctx.uvBuf) {
                this._aUVPick.bindFloatArrayBuffer(this.core.uvBuf);
            }

            if (this._aUV2Pick && !ctx.uvBuf2) {
                this._aUV2Pick.bindFloatArrayBuffer(this.core.uvBuf2);
            }

            this.core.indexBuf.bind();

            ctx.geoChunkId = this.id;
        }

        gl.drawElements(this.core.primitive, this.core.indexBuf.numItems, gl.UNSIGNED_SHORT, 0);
    }
});