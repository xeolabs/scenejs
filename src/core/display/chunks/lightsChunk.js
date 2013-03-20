/**
 *  Create display state chunk type for draw render of lights projection
 */
SceneJS_ChunkFactory.createChunkType({

    type:"lights",

    build:function () {

        this._uAmbient = this._uAmbient || [];
        this._uLightColor = this._uLightColor || [];
        this._uLightDir = this._uLightDir || [];
        this._uLightPos = this._uLightPos || [];
        this._uLightCutOff = this._uLightCutOff || [];
        this._uLightSpotExp = this._uLightSpotExp || [];
        this._uLightAttenuation = this._uLightAttenuation || [];

        var lights = this.core.lights;
        var program = this.program;

        for (var i = 0, len = lights.length; i < len; i++) {

            switch (lights[i].mode) {

                case "ambient":
                    this._uAmbient[i] = (program.draw.getUniformLocation("SCENEJS_uAmbient"));
                    break;

                case "dir":
                    this._uLightColor[i] = program.draw.getUniformLocation("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = null;
                    this._uLightDir[i] = program.draw.getUniformLocation("SCENEJS_uLightDir" + i);
                    break;

                case "point":
                    this._uLightColor[i] = program.draw.getUniformLocation("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = program.draw.getUniformLocation("SCENEJS_uLightPos" + i);
                    this._uLightDir[i] = null;
                    break;
            }
        }
    },

    draw:function (ctx) {

        if (ctx.dirty) {
            this.build();
        }

        var lights = this.core.lights;
        var light;

        var gl = this.program.gl;

        for (var i = 0, len = lights.length; i < len; i++) {

            light = lights[i];

            if (this._uAmbient[i]) {
                gl.uniform3fv(this._uAmbient[i], light.color);

            } else {

                if (this._uLightColor[i]) {
                    gl.uniform3fv(this._uLightColor[i], light.color);
                }

                if (this._uLightPos[i]) {
                    gl.uniform3fv(this._uLightPos[i], light.pos);
                }

                if (this._uLightDir[i]) {
                    gl.uniform3fv(this._uLightDir[i], light.dir);
                }
            }
        }
    }
});