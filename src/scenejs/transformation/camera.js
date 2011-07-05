(function() {

     var DEFAULT_TRANSFORM = {
        matrix : SceneJS_math_identityMat4(),
        fixed: true,
        isDefault : true
    };

    var idStack = [];
    var transformStack = [];
    var stackLen = 0;

    var nodeId;
    var transform;

    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                nodeId = null;
                transform = DEFAULT_TRANSFORM;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        if (!transform.matrixAsArray) {
                            transform.matrixAsArray = new Float32Array(transform.matrix);
                        }
                        SceneJS_renderModule.setProjectionTransform(nodeId, transform.matrixAsArray);
                    } else  {
                        SceneJS_renderModule.setProjectionTransform();
                    }
                    dirty = false;
                }
            });

    function pushTransform(id, t) {
        idStack[stackLen] = id;
        transformStack[stackLen] = t;
        stackLen++;
        nodeId = id;
        transform = t;
        dirty = true;
    };

    function popTransform() {
        stackLen--;
        if (stackLen > 0) {
            nodeId = idStack[stackLen - 1];
            transform = transformStack[stackLen - 1];
        } else {
            nodeId = null;
            transform = {
                matrix : SceneJS_math_identityMat4(),
                fixed: true,
                isDefault : true
            };
        }
        dirty = true;
    };

    var Camera = SceneJS.createNodeType("camera");

    Camera.prototype._init = function(params) {
        this.setOptics(params.optics); // Can be undefined
    };

    Camera.prototype.setOptics = function(optics) {
        if (!optics) {
            this.attr.optics = {
                type: "perspective",
                fovy : 60.0,
                aspect : 1.0,
                near : 0.10,
                far : 5000.0
            };
        } else {
            if (optics.type == "ortho") {
                this.attr.optics = {
                    type: optics.type,
                    left : optics.left || -1.0,
                    bottom : optics.bottom || -1.0,
                    near : optics.near || 0.1,
                    right : optics.right || 1.00,
                    top : optics.top || 1.0,
                    far : optics.far || 5000.0
                };
            } else if (optics.type == "frustum") {
                this.attr.optics = {
                    type: optics.type,
                    left : optics.left || -1.0,
                    bottom : optics.bottom || -1.0,
                    near : optics.near || 0.1,
                    right : optics.right || 1.00,
                    top : optics.top || 1.0,
                    far : optics.far || 5000.0
                };
            } else  if (optics.type == "perspective") {
                this.attr.optics = {
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
        this._resetCompilationMemos();
        return this;
    };

    Camera.prototype.getOptics = function() {
        var optics = {};
        for (var key in this.attr.optics) {
            if (this.attr.optics.hasOwnProperty(key)) {
                optics[key] = this.attr.optics[key];
            }
        }
        return optics;
    };

    Camera.prototype.getMatrix = function() {
        if (this._compileMemoLevel == 0) {
            this._rebuild();
        }
        return this._transform.matrix.slice(0);
    };

    Camera.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Camera.prototype._preCompile = function() {
        if (this._compileMemoLevel == 0) {
            this._rebuild();
        }
        pushTransform(this.attr.id, this._transform);
    };

    Camera.prototype._postCompile = function() {
        popTransform();
    };

    Camera.prototype._rebuild = function () {
        if (this._compileMemoLevel == 0) {
            var optics = this.attr.optics;
            if (optics.type == "ortho") {
                this._transform = {
                    type: optics.type,
                    optics : {
                        left: optics.left,
                        right: optics.right,
                        bottom: optics.bottom,
                        top: optics.top,
                        near: optics.near,
                        far : optics.far
                    },
                    matrix:SceneJS_math_orthoMat4c(
                            optics.left,
                            optics.right,
                            optics.bottom,
                            optics.top,
                            optics.near,
                            optics.far)
                };
            } else if (optics.type == "frustum") {
                this._transform = {
                    type: optics.type,
                    optics : {
                        left: optics.left,
                        right: optics.right,
                        bottom: optics.bottom,
                        top: optics.top,
                        near: optics.near,
                        far : optics.far
                    },
                    matrix: SceneJS_math_frustumMatrix4(
                            optics.left,
                            optics.right,
                            optics.bottom,
                            optics.top,
                            optics.near,
                            optics.far)
                };
            } else if (optics.type == "perspective") {
                this._transform = {
                    type: optics.type,
                    optics : {
                        fovy: optics.fovy,
                        aspect: optics.aspect,
                        near: optics.near,
                        far: optics.far
                    },
                    matrix:SceneJS_math_perspectiveMatrix4(
                            optics.fovy * Math.PI / 180.0,
                            optics.aspect,
                            optics.near,
                            optics.far)
                };
            }
            this._compileMemoLevel = 1;
        }
    };

})();