(function() {

    /**
     * The default state core singleton for {@link SceneJS.Camera} nodes
     */
    var defaultCore = {

        type: "camera",

        stateId: SceneJS._baseStateId++,

        /** Default orthographic projection matrix
         */
        mat: new Float32Array(
                SceneJS_math_orthoMat4c(
                        SceneJS_math_ORTHO_OBJ.left,
                        SceneJS_math_ORTHO_OBJ.right,
                        SceneJS_math_ORTHO_OBJ.bottom,
                        SceneJS_math_ORTHO_OBJ.top,
                        SceneJS_math_ORTHO_OBJ.near,
                        SceneJS_math_ORTHO_OBJ.far)),

        /** Default optical attributes for ortho projection
         */
        optics: SceneJS_math_ORTHO_OBJ
    };

    var coreStack = [];
    var stackLen = 0;

    /* Set default core on the display at the start of each new scene compilation
     */
    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.projTransform = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which defines the projection transform to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Camera = SceneJS_NodeFactory.createNodeType("camera");

    SceneJS.Camera.prototype._init = function(params) {
        if (this._core.useCount == 1) {
            this.setOptics(params.optics); // Can be undefined
        }
    };

    SceneJS.Camera.prototype.setOptics = function(optics) {
        var core = this._core;
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
        this._rebuild();
        this._engine.display.imageDirty = true;
    };

    SceneJS.Camera.prototype._rebuild = function () {
        var optics = this._core.optics;
        if (optics.type == "ortho") {
            this._core.matrix = SceneJS_math_orthoMat4c(
                    optics.left,
                    optics.right,
                    optics.bottom,
                    optics.top,
                    optics.near,
                    optics.far);

        } else if (optics.type == "frustum") {
            this._core.matrix = SceneJS_math_frustumMatrix4(
                    optics.left,
                    optics.right,
                    optics.bottom,
                    optics.top,
                    optics.near,
                    optics.far);

        } else if (optics.type == "perspective") {
            this._core.matrix = SceneJS_math_perspectiveMatrix4(
                    optics.fovy * Math.PI / 180.0,
                    optics.aspect,
                    optics.near,
                    optics.far);
        }
        if (!this._core.mat) {
            this._core.mat = new Float32Array(this._core.matrix);
        } else {
            this._core.mat.set(this._core.matrix);
        }
    };

    SceneJS.Camera.prototype.getOptics = function() {
        var optics = {};
        for (var key in this._core.optics) {
            if (this._core.optics.hasOwnProperty(key)) {
                optics[key] = this._core.optics[key];
            }
        }
        return optics;
    };

    SceneJS.Camera.prototype.getMatrix = function() {
        return this._core.matrix.slice(0);
    };

    /**
     * Compiles this camera node, setting this node's state core on the display, compiling sub-nodes,
     * then restoring the previous camera state core back onto the display on exit.
     */
    SceneJS.Camera.prototype._compile = function() {
        this._engine.display.projTransform = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.projTransform = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };
})();