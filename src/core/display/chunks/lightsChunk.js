/**
 *  Create display state chunk type for draw render of lights projection
 */
SceneJS_ChunkFactory.createChunkType({

    type:"lights",

    build:function () {

        this._uAmbientColor = this._uAmbientColor || [];
        this._uLightColor = this._uLightColor || [];
        this._uLightDir = this._uLightDir || [];
        this._uLightPos = this._uLightPos || [];
        this._uLightCutOff = this._uLightCutOff || [];
        this._uLightSpotExp = this._uLightSpotExp || [];
        this._uLightAttenuation = this._uLightAttenuation || [];
        this._uInnerCone = this._uInnerCone || [];
        this._uOuterCone = this._uOuterCone || [];

        var lights = this.core.lights;
        var program = this.program;

        for (var i = 0, len = lights.length; i < len; i++) {

            switch (lights[i].mode) {

                case "ambient":
                    this._uAmbientColor[i] = (program.draw.getUniform("SCENEJS_uAmbientColor"));
                    break;

                case "dir":
                    this._uLightColor[i] = program.draw.getUniform("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = null;
                    this._uLightDir[i] = program.draw.getUniform("SCENEJS_uLightDir" + i);
                    break;

                case "point":
                    this._uLightColor[i] = program.draw.getUniform("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = program.draw.getUniform("SCENEJS_uLightPos" + i);
                    this._uLightDir[i] = null;
                    this._uLightAttenuation[i] = program.draw.getUniform("SCENEJS_uLightAttenuation" + i);
                    break;

                case "spot":
                    this._uLightColor[i] = program.draw.getUniform("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = program.draw.getUniform("SCENEJS_uLightPos" + i);
                    this._uLightDir[i] = program.draw.getUniform("SCENEJS_uLightDir" + i);
                    this._uLightAttenuation[i] = program.draw.getUniform("SCENEJS_uLightAttenuation" + i);
                    this._uInnerCone[i] = program.draw.getUniform("SCENEJS_uInnerCone" + i);
                    this._uOuterCone[i] = program.draw.getUniform("SCENEJS_uOuterCone" + i);
                    break;
            }
        }
    },

    draw:function (frameCtx) {

        if (frameCtx.dirty) {
            this.build();
        }

        var lights = this.core.lights;
        var light;

        var gl = this.program.gl;

        for (var i = 0, len = lights.length; i < len; i++) {

            light = lights[i];

            if (this._uAmbientColor[i]) {
                this._uAmbientColor[i].setValue(light.color);

            } else {

                if (this._uLightColor[i]) {
                    this._uLightColor[i].setValue(light.color);
                }

                if (this._uLightPos[i]) {
                    this._uLightPos[i].setValue(light.pos);

                    if (this._uLightAttenuation[i]) {
                        this._uLightAttenuation[i].setValue(light.attenuation);
                    }
                }

                if (this._uLightDir[i]) {
                    this._uLightDir[i].setValue(light.dir);
                }

                if (this._uInnerCone[i]) {
                    this._uInnerCone[i].setValue(light.innerCone);
                }

                if (this._uOuterCone[i]) {
                    this._uOuterCone[i].setValue(light.outerCone);
                }
            }
        }
    }
});
