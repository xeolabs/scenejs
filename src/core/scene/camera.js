(function () {

    var defaultMatrix = SceneJS.math.perspectiveMatrix4(
        45, // fovy
        1, // aspect
        0.1, // near
        10000); // far

    var defaultMat = new Float32Array(defaultMatrix);

    // The default state core singleton for {@link SceneJS.Camera} nodes
    var defaultCore = {
        type:"camera",
        stateId:SceneJS._baseStateId++,
        matrix:defaultMatrix,
        mat:defaultMat,
        optics:{
            type:"perspective",
            fovy:45.0,
            aspect:1.0,
            near:0.1,
            far:10000.0
        }
    };

    var coreStack = [];
    var stackLen = 0;

    // Set default core on the display at the start of each new scene compilation
    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.projTransform = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines the projection transform to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Camera = SceneJS_NodeFactory.createNodeType("camera");

    SceneJS.Camera.prototype._init = function (params) {
        if (this._core.useCount == 1) {
            this.setOptics(params.optics); // Can be undefined

            // Rebuild on every scene tick
            // https://github.com/xeolabs/scenejs/issues/277
            var self = this;
            this._tick = this.getScene().on("tick", function () {
                if (self._core.dirty) {
                    self._core.rebuild();
                }
            });
        }
    };

    /**
     * Returns the default camera projection matrix
     * @return {Float32Array}
     */
    SceneJS.Camera.getDefaultMatrix = function () {
        return defaultMat;
    };

    SceneJS.Camera.prototype.setOptics = function (optics) {
        var core = this._core;
        if (!optics) {
            core.optics = {
                type:"perspective",
                fovy:60.0,
                aspect:1.0,
                near:0.1,
                far:10000.0
            };
        } else {
            var type = optics.type || core.optics.type;
            if (type == "ortho") {
                core.optics = SceneJS._applyIf(SceneJS.math.ORTHO_OBJ, {
                    type:type,
                    left:optics.left,
                    bottom:optics.bottom,
                    near:optics.near,
                    right:optics.right,
                    top:optics.top,
                    far:optics.far
                });
            } else if (type == "frustum") {
                core.optics = {
                    type:type,
                    left:optics.left || -1.0,
                    bottom:optics.bottom || -1.0,
                    near:optics.near || 0.1,
                    right:optics.right || 1.00,
                    top:optics.top || 1.0,
                    far:optics.far || 10000.0
                };
            } else if (type == "perspective") {
                core.optics = {
                    type:type,
                    fovy:optics.fovy || 60.0,
                    aspect:optics.aspect == undefined ? 1.0 : optics.aspect,
                    near:optics.near || 0.1,
                    far:optics.far || 10000.0
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
            this._core.matrix = SceneJS.math.orthoMat4c(
                optics.left,
                optics.right,
                optics.bottom,
                optics.top,
                optics.near,
                optics.far);

        } else if (optics.type == "frustum") {
            this._core.matrix = SceneJS.math.frustumMatrix4(
                optics.left,
                optics.right,
                optics.bottom,
                optics.top,
                optics.near,
                optics.far);

        } else if (optics.type == "perspective") {
            this._core.matrix = SceneJS.math.perspectiveMatrix4(
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
        this.publish("matrix", this._core.matrix);
    };

    SceneJS.Camera.prototype.getOptics = function () {
        var optics = {};
        for (var key in this._core.optics) {
            if (this._core.optics.hasOwnProperty(key)) {
                optics[key] = this._core.optics[key];
            }
        }
        return optics;
    };

    SceneJS.Camera.prototype.getMatrix = function () {
        return this._core.matrix.slice(0);
    };

    /**
     * Compiles this camera node, setting this node's state core on the display, compiling sub-nodes,
     * then restoring the previous camera state core back onto the display on exit.
     */
    SceneJS.Camera.prototype._compile = function () {
        this._engine.display.projTransform = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.projTransform = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Camera.prototype._destroy = function () {
        // Stop publishing matrix on each tick
        this.getScene().off(this._tick);
    };
})();
