/**
 * Scene node that applies a model-space translation transform to the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.translate
 * @extends SceneJS.node
 */
SceneJS.translate = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {
        var _mat;
        var xform;

        var _x = 0;
        var _y = 0;
        var _z = 1;

        this.setX = function(x) {
            _x = x;
            $._memoLevel = 0;
            return this;
        };

        this.getX = function() {
            return _x;
        };

        this.setY = function(y) {
            _y = y;
            $._memoLevel = 0;
            return this;
        };

        this.getY = function() {
            return _y;
        };

        this.setZ = function(z) {
            _z = z;
            $._memoLevel = 0;
            return this;
        };

        this.getZ = function() {
            return _z;
        };

        this.setXYZ = function(xyz) {
            _x = xyz.x == undefined ? 1 : xyz.x;
            _y = xyz.y == undefined ? 1 : xyz.y;
            _z = xyz.z == undefined ? 1 : xyz.z;
            $._memoLevel = 0;
            return this;
        };

        this.getXYZ = function() {
            return {
                x: _x,
                y: _y,
                z: _z
            };
        };

        var init = function(params) {
            this.setXYZ({x : params.x, y: params.y, z: params.z });
        };

        if (cfg.fixed) {
            init(cfg.getParams());
        }

        $._render = function(traversalContext, data) {
            if ($._memoLevel == 0) {
                if (!cfg.fixed) {
                    init(cfg.getParams(data));
                } else {
                    $._memoLevel = 1;
                }
                _mat = SceneJS_math_translationMat4v([_x, _y, _z]);
            }
            var superXform = SceneJS_modelTransformModule.getTransform();
            if ($._memoLevel < 2) {
                var tempMat = SceneJS_math_mulMat4(superXform.matrix, _mat);
                xform = {
                    localMatrix: _mat,
                    matrix: tempMat,
                    fixed: superXform.fixed && cfg.fixed
                };
                if ($._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
                    $._memoLevel = 2;
                }
            }
            SceneJS_modelTransformModule.setTransform(xform);
            this._renderChildren(traversalContext, data);
            SceneJS_modelTransformModule.setTransform(superXform);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};