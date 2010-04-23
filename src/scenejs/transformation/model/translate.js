/**
 * Scene node that applies a model-space translation transform to the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.translate
 * @extends SceneJS.node
 */
(function() {

     /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    SceneJS.translate = function() {

        var cfg = SceneJS._utils.getNodeConfig(arguments);

        return SceneJS._utils.createNode(

                "translate",

                cfg.children,

                new (function() {
                    var _memoLevel = NO_MEMO;
                    var _mat;
                    var xform;

                    var _x = 0;
                    var _y = 0;
                    var _z = 1;

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

                    this.setXYZ = function(xyz) {
                        _x = xyz.x == undefined ? 1 : xyz.x;
                        _y = xyz.y == undefined ? 1 : xyz.y;
                        _z = xyz.z == undefined ? 1 : xyz.z;
                        _memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getXYZ = function() {
                        return {
                            x: _x,
                            y: _y,
                            z: _z
                        };
                    };

                    this._init = function(params) {
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
                            _mat = SceneJS_math_translationMat4v([_x, _y, _z]);
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
})();
