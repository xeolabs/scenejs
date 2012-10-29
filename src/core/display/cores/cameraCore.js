SceneJS_CoreFactory.createCoreType("camera", {

    init : function(params) {

        var optics = params.optics;

        if (!optics) {

            this.optics = {
                type: "ortho",
                left :  -1.0,
                bottom :  -1.0,
                near :  0.1,
                right :  1.00,
                top :  1.0,
                far :  5000.0
            };

        } else {

            var opticsType = optics.type;

            if (opticsType == "ortho") {

                this.optics = SceneJS._applyIf(SceneJS_math_ORTHO_OBJ, {
                    type: optics.type,
                    left : optics.left,
                    bottom : optics.bottom,
                    near : optics.near,
                    right : optics.right,
                    top : optics.top,
                    far : optics.far
                });

            } else if (opticsType == "frustum") {

                this.optics = {
                    type: optics.type,
                    left : optics.left || -1.0,
                    bottom : optics.bottom || -1.0,
                    near : optics.near || 0.1,
                    right : optics.right || 1.00,
                    top : optics.top || 1.0,
                    far : optics.far || 5000.0
                };

            } else  if (optics.type == "perspective") {

                this.optics = {
                    type: optics.type,
                    fovy : optics.fovy || 60.0,
                    aspect: optics.aspect == undefined ? 1.0 : optics.aspect,
                    near : optics.near || 0.1,
                    far : optics.far || 5000.0
                };

            } else if (!optics.type) {

                throw SceneJS_error.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "SceneJS.Camera configuration invalid: optics type not specified - " +
                        "supported types are 'perspective', 'frustum' and 'ortho'");

            } else {

                throw SceneJS_error.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "SceneJS.Camera configuration invalid: optics type not supported - " +
                        "supported types are 'perspective', 'frustum' and 'ortho'");
            }
        }

        this.dirty = true;
    },

    build: function() {

        var optics = this.optics;

        if (optics.type == "ortho") {

            this.matrix = SceneJS_math_orthoMat4c(
                    optics.left,
                    optics.right,
                    optics.bottom,
                    optics.top,
                    optics.near,
                    optics.far);

        } else if (optics.type == "frustum") {

            this.matrix = SceneJS_math_frustumMatrix4(
                    optics.left,
                    optics.right,
                    optics.bottom,
                    optics.top,
                    optics.near,
                    optics.far);

        } else if (optics.type == "perspective") {

            this.matrix = SceneJS_math_perspectiveMatrix4(
                    optics.fovy * Math.PI / 180.0,
                    optics.aspect,
                    optics.near,
                    optics.far);
        }

        if (!this.mat) {
            this.mat = new Float32Array(this.matrix);

        } else {

            this.mat.set(this.matrix);
        }

        this.dirty = false;
    }
});