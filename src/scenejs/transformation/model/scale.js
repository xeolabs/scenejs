/**
 * Scene node that applies a model-space scaling transform to the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.scale
 * @extends SceneJS.node
 */
(function() {

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    SceneJS.scale = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);

        return SceneJS._utils.createNode(
                "scale",
                cfg.children,

                new (function() {
                    this._memoLevel = NO_MEMO;
                    this._mat = null;
                    this._xform = null;

                    this._x = 0;
                    this._y = 0;
                    this._z = 1;

                    this.setX = function(x) {
                        this._x = x;
                        this._memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getX = function() {
                        return this._x;
                    };

                    this.setY = function(y) {
                        this._y = y;
                        this._memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getY = function() {
                        return this._y;
                    };

                    this.setZ = function(z) {
                        this._z = z;
                        this._memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getZ = function() {
                        return this._z;
                    };

                    this.setXYZ = function(xyz) {
                        this._x = xyz.x == undefined ? 1 : xyz.x;
                        this._y = xyz.y == undefined ? 1 : xyz.y;
                        this._z = xyz.z == undefined ? 1 : xyz.z;
                        this._memoLevel = NO_MEMO;
                        return this;
                    };

                    this.getXYZ = function() {
                        return {
                            x: this._x,
                            y: this._y,
                            z: this._z
                        };
                    };

                    this._init = function(params) {
                        this.setXYZ({x : params.x, y: params.y, z: params.z });
                    };

                    if (cfg.fixed) {
                        this._init(cfg.getParams());
                    }

                    this._render = function(traversalContext, data) {
                        if (this._memoLevel == NO_MEMO) {
                            if (!cfg.fixed) {
                                this._init(cfg.getParams(data));
                            } else {
                                this._memoLevel = FIXED_CONFIG;
                            }
                            this._mat = SceneJS_math_scalingMat4v([this._x, this._y, this._z]);
                        }
                        var superXform = SceneJS_modelTransformModule.getTransform();
                        if (this._memoLevel < FIXED_MODEL_SPACE) {
                            var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
                            this._xform = {
                                localMatrix: this._mat,
                                matrix: tempMat,
                                fixed: superXform.fixed && cfg.fixed
                            };
                            if (this._memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                                this._memoLevel = FIXED_MODEL_SPACE;
                            }
                        }
                        SceneJS_modelTransformModule.setTransform(this._xform);
                        this._renderChildren(traversalContext, data);
                        SceneJS_modelTransformModule.setTransform(superXform);
                    };
                })());
    };
})();
