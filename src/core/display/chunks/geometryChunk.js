/**
 *  Create display state chunk type for draw and pick render of geometry
 */
SceneJS_ChunkFactory.createChunkType({

    type:"geometry",

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

            if (this.core.interleavedBuf && !this.core.interleavedBuf.dirty) {
                this.core.interleavedBuf.bind();
                if (this._aVertexDraw && !ctx.vertexBuf) {
                    this._aVertexDraw.bindInterleavedFloatArrayBuffer(3, this.core.interleavedStride, this.core.interleavedPositionOffset);
                }
                if (this._aNormalDraw && !ctx.normalBuf) {
                    this._aNormalDraw.bindInterleavedFloatArrayBuffer(3, this.core.interleavedStride, this.core.interleavedNormalOffset);
                }
                if (this._aUVDraw && !ctx.uvBuf) {
                    this._aUVDraw.bindInterleavedFloatArrayBuffer(2, this.core.interleavedStride, this.core.interleavedUVOffset);
                }
                if (this._aUV2Draw && !ctx.uv2Buf) {
                    this._aUV2Draw.bindInterleavedFloatArrayBuffer(2, this.core.interleavedStride, this.core.interleavedUV2Offset);
                }
                if (this._aColorDraw && !ctx.colorBuf) {
                    this._aColorDraw.bindInterleavedFloatArrayBuffer(4, this.core.interleavedStride, this.core.interleavedColorOffset);
                }
            } else {
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
            }

            this.core.indexBuf.bind();

    },

    pick:function (ctx) {

        var gl = this.program.gl;

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
    }
});
