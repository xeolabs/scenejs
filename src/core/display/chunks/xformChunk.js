SceneJS_ChunkFactory.createChunkType({

    type: "xform",

    build: function () {

        var draw = this.program.draw;

        this._uMatLocationDraw = draw.getUniform("SCENEJS_uMMatrix");
        this._uNormalMatLocationDraw = draw.getUniform("SCENEJS_uMNMatrix");

        var pick = this.program.pick;

        this._uMatLocationPick = pick.getUniform("SCENEJS_uMMatrix");
    },

    draw: function (frameCtx) {

        /* Rebuild core's matrix from matrices at cores on path up to root
         */
        if (SceneJS_configsModule.configs.forceXFormCoreRebuild === true || this.core.dirty && this.core.build) {
            this.core.build();
        }

        var gl = this.program.gl;

        if (this._uMatLocationDraw) {
            this._uMatLocationDraw.setValue(this.core.mat);
        }

        if (this._uNormalMatLocationDraw) {
            this._uNormalMatLocationDraw.setValue(this.core.normalMat);
        }

        frameCtx.modelMat = this.core.mat;
    },

    pick: function (frameCtx) {

        /* Rebuild core's matrix from matrices at cores on path up to root
         */
        if (this.core.dirty) {
            this.core.build();
        }

        var gl = this.program.gl;

        if (this._uMatLocationPick) {
            this._uMatLocationPick.setValue(this.core.mat);
        }

        frameCtx.modelMat = this.core.mat;
    }
});
