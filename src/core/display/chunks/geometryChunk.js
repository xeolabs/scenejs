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

    morphDraw:function () {

        var target1 = this.core.targets[this.core.key1]; // Keys will update
        var target2 = this.core.targets[this.core.key2];

        if (this._aMorphVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(target1.vertexBuf);
            this._aMorphVertexDraw.bindFloatArrayBuffer(target2.vertexBuf);
        } else if (this._aVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
        }

        if (this._aMorphNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(target1.normalBuf);
            this._aMorphNormalDraw.bindFloatArrayBuffer(target2.normalBuf);
        } else if (this._aNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
        }

        if (this._aMorphUVDraw) {
            this._aUVDraw.bindFloatArrayBuffer(target1.uvBuf);
            this._aMorphUVDraw.bindFloatArrayBuffer(target2.uvBuf);
        } else if (this._aUVDraw) {
            this._aUVDraw.bindFloatArrayBuffer(this.core2.uvBuf);
        }

        if (this._aMorphUV2Draw) {
            this._aUV2Draw.bindFloatArrayBuffer(target1.uvBuf2);
            this._aMorphUV2Draw.bindFloatArrayBuffer(target2.uvBuf2);
        } else if (this._aUV2Draw) {
            this._aUV2Draw.bindFloatArrayBuffer(this.core2.uvBuf2);
        }

        if (this._aMorphColorDraw) {
            this._aColorDraw.bindFloatArrayBuffer(target1.colorBuf);
            this._aMorphColorDraw.bindFloatArrayBuffer(target2.colorBuf);
        } else if (this._aColorDraw) {
            this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
        }

        if (this._uMorphFactorDraw) {
            this.program.gl.uniform1f(this._uMorphFactorDraw, this.core.factor); // Bind LERP factor
        }

    },

    draw:function (ctx) {

        if (this.core.targets && this.core.targets.length) {
            this.morphDraw();
        } else {

            if (this.core2.interleavedBuf && !this.core2.interleavedBuf.dirty) {
                this.core2.interleavedBuf.bind();
                if (this._aVertexDraw) {
                    this._aVertexDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedPositionOffset);
                }
                if (this._aNormalDraw) {
                    this._aNormalDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedNormalOffset);
                }
                if (this._aUVDraw) {
                    this._aUVDraw.bindInterleavedFloatArrayBuffer(2, this.core2.interleavedStride, this.core2.interleavedUVOffset);
                }
                if (this._aUV2Draw) {
                    this._aUV2Draw.bindInterleavedFloatArrayBuffer(2, this.core2.interleavedStride, this.core2.interleavedUV2Offset);
                }
                if (this._aColorDraw) {
                    this._aColorDraw.bindInterleavedFloatArrayBuffer(4, this.core2.interleavedStride, this.core2.interleavedColorOffset);
                }
            } else {
                if (this._aVertexDraw) {
                    this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
                }

                if (this._aNormalDraw) {
                    this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
                }

                if (this._aUVDraw) {
                    this._aUVDraw.bindFloatArrayBuffer(this.core2.uvBuf);
                }

                if (this._aUV2Draw) {
                    this._aUV2Draw.bindFloatArrayBuffer(this.core2.uvBuf2);
                }

                if (this._aColorDraw) {
                    this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
                }
            }

        }

        this.core2.indexBuf.bind();

    },

    morphPick:function () {

        var target1 = this.core.targets[this.core.key1]; // Keys will update
        var target2 = this.core.targets[this.core.key2];

        if (this._aMorphVertexPick) {
            this._aVertexPick.bindFloatArrayBuffer(target1.vertexBuf);
            this._aMorphVertexPick.bindFloatArrayBuffer(target2.vertexBuf);
        } else if (this._aVertexPick) {
            this._aVertexPick.bindFloatArrayBuffer(this.core2.vertexBuf);
        }

        if (this._aMorphNormalPick) {
            this._aNormalPick.bindFloatArrayBuffer(target1.normalBuf);
            this._aMorphNormalPick.bindFloatArrayBuffer(target2.normalBuf);
        } else if (this._aNormalPick) {
            this._aNormalPick.bindFloatArrayBuffer(this.core2.normalBuf);
        }

        if (this._aMorphUVPick) {
            this._aUVPick.bindFloatArrayBuffer(target1.uvBuf);
            this._aMorphUVPick.bindFloatArrayBuffer(target2.uvBuf);
        } else if (this._aUVPick) {
            this._aUVPick.bindFloatArrayBuffer(this.core2.uvBuf);
        }

        if (this._aMorphUV2Pick) {
            this._aUV2Pick.bindFloatArrayBuffer(target1.uvBuf2);
            this._aMorphUV2Pick.bindFloatArrayBuffer(target2.uvBuf2);
        } else if (this._aUV2Pick) {
            this._aUV2Pick.bindFloatArrayBuffer(this.core2.uvBuf2);
        }

        if (this._aMorphColorPick) {
            this._aColorPick.bindFloatArrayBuffer(target1.colorBuf);
            this._aMorphColorPick.bindFloatArrayBuffer(target2.colorBuf);
        } else if (this._aColorPick) {
            this._aColorPick.bindFloatArrayBuffer(this.core2.colorBuf);
        }

        if (this._uMorphFactorPick) {
            this.program.gl.uniform1f(this._uMorphFactorPick, this.core.factor); // Bind LERP factor
        }

    },

    pick:function (ctx) {

        if (this.core.targets && this.core.targets.length) {
            this.morphPick();
        } else {

            if (this._aVertexPick) {
                this._aVertexPick.bindFloatArrayBuffer(this.core2.vertexBuf);
            }

            if (this._aNormalPick) {
                this._aNormalPick.bindFloatArrayBuffer(this.core2.normalBuf);
            }

            if (this._aUVPick) {
                this._aUVPick.bindFloatArrayBuffer(this.core2.uvBuf);
            }

            if (this._aUV2Pick) {
                this._aUV2Pick.bindFloatArrayBuffer(this.core2.uvBuf2);
            }

        }

        this.core2.indexBuf.bind();
    }
});
