/**
 * Scene node that constructs a 'lookAt' view transformation matrix and sets it on the current shader.
 */

(function() {
    var backend = SceneJS._backends.getBackend('view-transform');
    var errorBackend = SceneJS._backends.getBackend('error');

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_SPACE = 2;    // Both node config and model-space are fixed

    SceneJS.lookAt = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);

        return SceneJS._utils.createNode(
                "lookAt",
                cfg.children,

                new (function() {
                    var _memoLevel = NO_MEMO;

                    var _mat;
                    var xform;

                    var _eyeX = 0;
                    var _eyeY = 0;
                    var _eyeZ = 1;

                    var _lookX = 0;
                    var _lookY = 0;
                    var _lookZ = 0;

                    var _upX = 0;
                    var _upY = 1;
                    var _upZ = 0;

                    this.setEye = function(eye) {
                        _eyeX = eye.x || 0;
                        _eyeY = eye.y || 0;
                        _eyeZ = eye.z || 0;
                        _memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getEye = function() {
                        return {
                            x: _eyeX,
                            y: _eyeY,
                            z: _eyeZ
                        };
                    };

                    this.setLook = function(look) {
                        _lookX = look.x || 0;
                        _lookY = look.y || 0;
                        _lookZ = look.z || 0;
                        _memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getLook = function() {
                        return {
                            x: _lookX,
                            y: _lookY,
                            z: _lookZ
                        };
                    };

                    this.setUp = function(up) {
                        var x = up.x || 0;
                        var y = up.y || 0;
                        var z = up.z || 0;
                        if (x + y + z == 0) {
                            errorBackend.fatalError(
                                    new SceneJS.exceptions.IllegalRotateConfigException(
                                            "SceneJS.lookAt up vector is zero length - at least one of its x,y and z components must be non-zero"));
                        }
                        _upX = x;
                        _upY = y;
                        _upZ = z;
                        _memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getUp = function() {
                        return {
                            x: _upX,
                            y: _upY,
                            z: _upZ
                        };
                    };

                    this._init = function(params) {
                        if (params.eye) {
                            this.setEye(params.eye);
                        }
                        if (params.look) {
                            this.setLook(params.look);
                        }
                        if (params.up) {
                            this.setUp(params.up);
                        }
                    };

                    if (cfg.fixed) {
                        this._init(cfg.getParams());
                    }

                    this._render = function(traversalContext, data) {
                        if (_memoLevel == NO_MEMO) {
                            if (!cfg.fixed) {
                                this._init(cfg.getParams(data));
                            } else {
                                _memoLevel = FIXED_CONFIG;
                            }
                            _mat = SceneJS_math_lookAtMat4c(
                                    _eyeX, _eyeY, _eyeZ,
                                    _lookX, _lookY, _lookZ,
                                    _upX, _upY, _upZ);
                        }
                        var superXform = backend.getTransform();
                        if (_memoLevel < FIXED_SPACE) {
                            var tempMat = SceneJS_math_mulMat4(superXform.matrix, _mat);
                            xform = {
                                type: "lookat",
                                matrix: tempMat,
                                lookAt : {
                                    eye: { x: _eyeX, y: _eyeY, z: _eyeZ },
                                    look: { x: _lookX, y: _lookY, z: _lookZ },
                                    up:  { x: _upX, y: _upY, z: _upZ }
                                },
                                fixed: superXform.fixed && cfg.fixed
                            };
                            if (_memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if space fixed
                                _memoLevel = FIXED_SPACE;
                            }
                        }
                        backend.setTransform(xform);
                        this._renderChildren(traversalContext, data);
                        backend.setTransform(superXform);
                    };
                })());
    };
})();