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

        this._aMorphVertexDraw = draw.getAttribute("SCENEJS_aMorphVertex");
        this._aMorphNormalDraw = draw.getAttribute("SCENEJS_aMorphNormal");
        this._aMorphUVDraw = draw.getAttribute("SCENEJS_aMorphUVCoord");
        this._aMorphUV2Draw = draw.getAttribute("SCENEJS_aMorphUVCoord2");
        this._aMorphColorDraw = draw.getAttribute("SCENEJS_aMorphColor");
        this._uMorphFactorDraw = draw.getUniformLocation("SCENEJS_uMorphFactor");

        var pick = this.program.pick;

        this._aVertexPick = pick.getAttribute("SCENEJS_aVertex");
        this._aNormalPick = pick.getAttribute("SCENEJS_aNormal");
        this._aUVPick = pick.getAttribute("SCENEJS_aUVCoord");
        this._aUV2Pick = pick.getAttribute("SCENEJS_aUVCoord2");
        this._aColorPick = pick.getAttribute("SCENEJS_aVertexColor");

        this._aMorphVertexPick = pick.getAttribute("SCENEJS_aMorphVertex");
        this._aMorphNormalPick = pick.getAttribute("SCENEJS_aMorphNormal");
        this._aMorphUVPick = pick.getAttribute("SCENEJS_aMorphUVCoord");
        this._aMorphUV2Pick = pick.getAttribute("SCENEJS_aMorphUVCoord2");
        this._aMorphColorPick = pick.getAttribute("SCENEJS_aMorphColor");
        this._uMorphFactorPick = pick.getUniformLocation("SCENEJS_uMorphFactor");
    },

    morphDraw:function (ctx) {

        var targets = this.core.targets;

        if (!targets || targets.length == 0) {
            ctx.vertexBuf = false;
            ctx.normalBuf = false;
            ctx.uvBuf = false;
            ctx.uvBuf2 = false;
            ctx.colorBuf = false;
            return;
        }

        var gl = this.program.gl;

        var target1 = this.core.targets[this.core.key1]; // Keys will update
        var target2 = this.core.targets[this.core.key2];

        if (this._aMorphVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(target1.vertexBuf);
            this._aMorphVertexDraw.bindFloatArrayBuffer(target2.vertexBuf);
            ctx.vertexBuf = true;
        } else {
            ctx.vertexBuf = false;
        }

        if (this._aMorphNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(target1.normalBuf);
            this._aMorphNormalDraw.bindFloatArrayBuffer(target2.normalBuf);
            ctx.normalBuf = true;
        } else {
            ctx.normalBuf = false;
        }

        if (this._aMorphUVDraw) {
            this._aUVDraw.bindFloatArrayBuffer(target1.uvBuf);
            this._aMorphUVDraw.bindFloatArrayBuffer(target2.uvBuf);
            ctx.uvBuf = true;
        } else {
            ctx.uvBuf = false;
        }

        if (this._aMorphUV2Draw) {
            this._aUV2Draw.bindFloatArrayBuffer(target1.uvBuf2);
            this._aMorphUV2Draw.bindFloatArrayBuffer(target2.uvBuf2);
            ctx.uvBuf2 = true;
        } else {
            ctx.uvBuf2 = false;
        }

        if (this._aMorphColorDraw) {
            this._aColorDraw.bindFloatArrayBuffer(target1.colorBuf);
            this._aMorphColorDraw.bindFloatArrayBuffer(target2.colorBuf);
            ctx.colorBuf = true;
        } else {
            ctx.colorBuf = false;
        }

        if (this._uMorphFactorDraw) {
            gl.uniform1f(this._uMorphFactorDraw, this.core.factor); // Bind LERP factor
        }
    },

    draw:function (ctx) {

        this.morphDraw(ctx);

        var gl = this.program.gl;

            if (this.core2.interleavedBuf && !this.core2.interleavedBuf.dirty) {
                this.core2.interleavedBuf.bind();
                if (this._aVertexDraw && !ctx.vertexBuf) {
                    this._aVertexDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedPositionOffset);
                }
                if (this._aNormalDraw && !ctx.normalBuf) {
                    this._aNormalDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedNormalOffset);
                }
                if (this._aUVDraw && !ctx.uvBuf) {
                    this._aUVDraw.bindInterleavedFloatArrayBuffer(2, this.core2.interleavedStride, this.core2.interleavedUVOffset);
                }
                if (this._aUV2Draw && !ctx.uv2Buf) {
                    this._aUV2Draw.bindInterleavedFloatArrayBuffer(2, this.core2.interleavedStride, this.core2.interleavedUV2Offset);
                }
                if (this._aColorDraw && !ctx.colorBuf) {
                    this._aColorDraw.bindInterleavedFloatArrayBuffer(4, this.core2.interleavedStride, this.core2.interleavedColorOffset);
                }
            } else {
                if (this._aVertexDraw && !ctx.vertexBuf) {
                    this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
                }

                if (this._aNormalDraw && !ctx.normalBuf) {
                    this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
                }

                if (this._aUVDraw && !ctx.uvBuf) {
                    this._aUVDraw.bindFloatArrayBuffer(this.core2.uvBuf);
                }

                if (this._aUV2Draw && !ctx.uvBuf2) {
                    this._aUV2Draw.bindFloatArrayBuffer(this.core2.uvBuf2);
                }

                if (this._aColorDraw && !ctx.colorBuf) {
                    this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
                }
            }

            this.core2.indexBuf.bind();

    },

    morphPick:function (ctx) {

        var targets = this.core.targets;

        if (!targets || targets.length == 0) {
            ctx.vertexBuf = false;
            ctx.normalBuf = false;
            ctx.uvBuf = false;
            ctx.uvBuf2 = false;
            ctx.colorBuf = false;
            return;
        }

        var gl = this.program.gl;

        var target1 = targets[this.core.key1]; // Keys will update
        var target2 = targets[this.core.key2];

        if (this._aMorphVertexPick) {
            this._aVertexPick.bindFloatArrayBuffer(target1.vertexBuf);
            this._aMorphVertexPick.bindFloatArrayBuffer(target2.vertexBuf);
            ctx.vertexBuf = true;
        } else {
            ctx.vertexBuf = false;
        }

        if (this._aMorphNormalPick) {
            this._aNormalPick.bindFloatArrayBuffer(target1.normalBuf);
            this._aMorphNormalPick.bindFloatArrayBuffer(target2.normalBuf);
            ctx.normalBuf = true;
        } else {
            ctx.normalBuf = false;
        }

        if (this._aMorphUVPick) {
            this._aUVPick.bindFloatArrayBuffer(target1.uvBuf);
            this._aMorphUVPick.bindFloatArrayBuffer(target2.uvBuf);
            ctx.uvBuf = true;
        } else {
            ctx.uvBuf = false;
        }

        if (this._aMorphUV2Pick) {
            this._aUV2Pick.bindFloatArrayBuffer(target1.uvBuf2);
            this._aMorphUV2Pick.bindFloatArrayBuffer(target2.uvBuf2);
            ctx.uvBuf2 = true;
        } else {
            ctx.uvBuf2 = false;
        }

        if (this._aMorphColorPick) {
            this._aColorPick.bindFloatArrayBuffer(target1.colorBuf);
            this._aMorphColorPick.bindFloatArrayBuffer(target2.colorBuf);
            ctx.colorBuf = true;
        } else {
            ctx.colorBuf = false;
        }

        if (this._uMorphFactorPick) {
            gl.uniform1f(this._uMorphFactorPick, this.core.factor); // Bind LERP factor
        }
    },

    pick:function (ctx) {

        this.morphPick(ctx);

        var gl = this.program.gl;

            if (this._aVertexPick && !ctx.vertexBuf) {
                this._aVertexPick.bindFloatArrayBuffer(this.core2.vertexBuf);
            }

            if (this._aNormalPick && !ctx.normalBuf) {
                this._aNormalPick.bindFloatArrayBuffer(this.core2.normalBuf);
            }

            if (this._aUVPick && !ctx.uvBuf) {
                this._aUVPick.bindFloatArrayBuffer(this.core2.uvBuf);
            }

            if (this._aUV2Pick && !ctx.uvBuf2) {
                this._aUV2Pick.bindFloatArrayBuffer(this.core2.uvBuf2);
            }

            this.core2.indexBuf.bind();
    }
});
