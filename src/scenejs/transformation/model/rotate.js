/**
 * Scene node that applies a model-space rotation transform to the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.scale
 * @extends SceneJS.node
 */
SceneJS.rotate = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed

    return SceneJS._utils.createNode(
            "rotate",
            cfg.children,
            
            new (function() {
                var _memoLevel = NO_MEMO;
                var _mat;
                var xform;

                var _angle = 0;
                var _x = 0;
                var _y = 0;
                var _z = 1;

                /** Sets the rotation angle
                 * @param {double} angle Rotation angle in degrees
                 * @returns This node
                 */
                this.setAngle = function(angle) {
                    _angle = angle || 0;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                /** Returns the angle of rotation
                 * @returns {double} The angle in degrees
                 */
                this.getAngle = function() {
                    return _angle;
                };

                /**
                 * Sets the vector about which rotation occurs. The elements of the vector must not all be zero.
                 * @param {object} vector The vector - eg. {x: 0, y: 1, z: 0}
                 * @returns This node
                 */
                this.setXYZ = function(xyz) {
                    var x = xyz.x || 0;
                    var y = xyz.y || 0;
                    var z = xyz.z || 0;
                    if (x + y + z == 0) {
                        SceneJS_errorModule.fatalError(
                                new SceneJS.exceptions.IllegalRotateConfigException(
                                        "SceneJS.rotate vector is zero - at least one of properties x,y and z must be non-zero"));
                    }
                    _x = x;
                    _y = y;
                    _z = z;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                /** Returns the vector about which rotation occurs
                 * @returns {object} the vector, eg. {x: 0, y: 1, z: 0}
                 */
                this.getXYZ = function() {
                    return {
                        x: _x,
                        y: _y,
                        z: _z
                    };
                };

                this.setX = function(x) {
                    _x = x;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                this.getX = function() {
                    return _x;
                };

                this.setY = function(y) {
                    _y = y;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                this.getY = function() {
                    return _y;
                };

                this.setZ = function(z) {
                    _z = z;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                this.getZ = function() {
                    return _z;
                };

                this._init = function(params) {
                    if (params.angle) {
                        this.setAngle(params.angle);
                    }
                    this.setXYZ({x : params.x, y: params.y, z: params.z });
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
                        _mat = SceneJS_math_rotationMat4v(_angle * Math.PI / 180.0, [_x, _y, _z]);
                    }
                    var superXform = SceneJS_modelTransformModule.getTransform();
                    if (_memoLevel < FIXED_MODEL_SPACE) {
                        var tempMat = SceneJS_math_mulMat4(superXform.matrix, _mat);
                        xform = {
                            localMatrix: _mat,
                            matrix: tempMat,
                            fixed: superXform.fixed && cfg.fixed
                        };
                        if (_memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                            _memoLevel = FIXED_MODEL_SPACE;
                        }
                    }
                    SceneJS_modelTransformModule.setTransform(xform);
                    this._renderChildren(traversalContext, data);
                    SceneJS_modelTransformModule.setTransform(superXform);
                };
            })());
};