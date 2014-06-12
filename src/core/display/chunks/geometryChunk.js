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

        this.VAO = null;
        this.VAOHasInterleavedBuf = false;

        var pick = this.program.pick;

        this._aVertexPick = pick.getAttribute("SCENEJS_aVertex");
        this._aNormalPick = pick.getAttribute("SCENEJS_aNormal");
        this._aUVPick = pick.getAttribute("SCENEJS_aUVCoord");
        this._aUV2Pick = pick.getAttribute("SCENEJS_aUVCoord2");
        this._aColorPick = pick.getAttribute("SCENEJS_aVertexColor");
    },

    recycle:function () {
        if (this.VAO) {
            // Guarantee that the old VAO is deleted immediately when recycling the object.
            var VAOExt = this.program.gl.getExtension("OES_vertex_array_object");
            VAOExt.deleteVertexArrayOES(this.VAO);
        }
    },

    draw:function (ctx) {

        var gl = this.program.gl;

        if (ctx.geoChunkId != this.id) { // HACK until we have distinct state chunks for VBOs and draw call
            var ctxBufsActive = ctx.vertexBuf || ctx.normalBuf || ctx.uvBuf || ctx.uvBuf2 || ctx.colorBuf;
            if (this.VAO && (ctxBufsActive ||
                this.core.interleavedBuf && this.core.interleavedBuf.dirty && this.VAOHasInterleavedBuf)) {
                // Need to recreate VAO to refer to separate buffers, or can't use VAO due to buffers
                // specified outside.
                ctx.VAO.deleteVertexArrayOES(this.VAO);
                this.VAO = null;
            }
            if (this.VAO) {
                ctx.VAO.bindVertexArrayOES(this.VAO);
            } else {
                var useInterleavedBuf = (this.core.interleavedBuf && !this.core.interleavedBuf.dirty);
                if (ctx.VAO && !ctxBufsActive) {
                    this.VAO = ctx.VAO.createVertexArrayOES();
                    ctx.VAO.bindVertexArrayOES(this.VAO);
                    this.VAOHasInterleavedBuf = useInterleavedBuf;
                }

                if (useInterleavedBuf) {
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
            }
        }

        gl.drawElements(this.core.primitive, this.core.indexBuf.numItems, gl.UNSIGNED_SHORT, 0);

        if (this.VAO) {
            // We don't want following nodes that don't use their own VAOs to muck up
            // this node's VAO, so we need to unbind it.
            ctx.VAO.bindVertexArrayOES(null);
        } else {
            ctx.geoChunkId = this.id;
        }
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
