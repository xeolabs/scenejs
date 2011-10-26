(function() {

    var idStack = [];
    var transformStack = [];
    var stackLen = 0;

    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setProjectionTransform(idStack[stackLen - 1], transformStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setProjectionTransform();
                    }
                    dirty = false;
                }
            });

    var Camera = SceneJS.createNodeType("camera");

    Camera.prototype._init = function(params) {
        if (this.core._nodeCount == 1) {
            this.setOptics(params.optics); // Can be undefined
        }
    };

    Camera.prototype.setOptics = function(optics) {
        var core = this.core;
        if (!optics) {
            core.optics = {
                type: optics.type,
                left : optics.left || -1.0,
                bottom : optics.bottom || -1.0,
                near : optics.near || 0.1,
                right : optics.right || 1.00,
                top : optics.top || 1.0,
                far : optics.far || 5000.0
            };
        } else {
            if (optics.type == "ortho") {
                core.optics = SceneJS._applyIf(SceneJS_math_ORTHO_OBJ, {
                    type: optics.type,
                    left : optics.left,
                    bottom : optics.bottom,
                    near : optics.near,
                    right : optics.right,
                    top : optics.top,
                    far : optics.far
                });
            } else if (optics.type == "frustum") {
                core.optics = {
                    type: optics.type,
                    left : optics.left || -1.0,
                    bottom : optics.bottom || -1.0,
                    near : optics.near || 0.1,
                    right : optics.right || 1.00,
                    top : optics.top || 1.0,
                    far : optics.far || 5000.0
                };
            } else  if (optics.type == "perspective") {
                core.optics = {
                    type: optics.type,
                    fovy : optics.fovy || 60.0,
                    aspect: optics.aspect || 1.0,
                    near : optics.near || 0.1,
                    far : optics.far || 5000.0
                };
            } else if (!optics.type) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "Camera configuration invalid: optics type not specified - " +
                        "supported types are 'perspective', 'frustum' and 'ortho'");
            } else {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "Camera configuration invalid: optics type not supported - " +
                        "supported types are 'perspective', 'frustum' and 'ortho'");
            }
        }
        this._rebuild();
    };

    Camera.prototype._rebuild = function () {
        var optics = this.core.optics;
        if (optics.type == "ortho") {
            this.core.matrix = SceneJS_math_orthoMat4c(
                    optics.left,
                    optics.right,
                    optics.bottom,
                    optics.top,
                    optics.near,
                    optics.far);

        } else if (optics.type == "frustum") {
            this.core.matrix = SceneJS_math_frustumMatrix4(
                    optics.left,
                    optics.right,
                    optics.bottom,
                    optics.top,
                    optics.near,
                    optics.far);

        } else if (optics.type == "perspective") {
            this.core.matrix = SceneJS_math_perspectiveMatrix4(
                    optics.fovy * Math.PI / 180.0,
                    optics.aspect,
                    optics.near,
                    optics.far);
        }
        if (!this.core.matrixAsArray) {
            this.core.matrixAsArray = new Float32Array(this.core.matrix);
        } else {
            this.core.matrixAsArray.set(this.core.matrix);
        }
    };

    Camera.prototype.getOptics = function() {
        var optics = {};
        for (var key in this.core.optics) {
            if (this.core.optics.hasOwnProperty(key)) {
                optics[key] = this.core.optics[key];
            }
        }
        return optics;
    };

    Camera.prototype.getMatrix = function() {
        if (this._compileMemoLevel == 0) {
            this._rebuild();
        }
        return this.core.matrix.slice(0);
    };

    Camera.prototype._compile = function() {
        idStack[stackLen] = this.attr.id;
        transformStack[stackLen] = this.core;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };
})();