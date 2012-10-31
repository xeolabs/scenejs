/**
 * Create display state chunk type for draw render of material transform
 */
SceneJS_ChunkFactory.createChunkType({

    type:"morphGeometry",

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

    draw:function (ctx) {

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

    pick:function (ctx) {

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

        if (this._uMorphFactorDraw) {
            gl.uniform1f(this._uMorphFactorDraw, this.core.factor); // Bind LERP factor
        }
    }
});
