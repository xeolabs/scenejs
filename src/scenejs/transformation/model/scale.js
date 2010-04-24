/**
 * Scene node that applies a model-space scaling transform to the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.scale
 * @extends SceneJS.node
 */


SceneJS.scale = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {

        var _mat = null;
        var _xform = null;

        var _x = 0;
        var _y = 0;
        var _z = 1;

        $.setX = function(x) {
            _x = x;
            $._memoLevel = 0;
            return $;
        };

        $.getX = function() {
            return _x;
        };

        $.setY = function(y) {
            _y = y;
            $._memoLevel = 0;
            return $;
        };

        $.getY = function() {
            return _y;
        };

        $.setZ = function(z) {
            _z = z;
            $._memoLevel = 0;
            return $;
        };

        $.getZ = function() {
            return _z;
        };

        $.setXYZ = function(xyz) {
            _x = xyz.x == undefined ? 1 : xyz.x;
            _y = xyz.y == undefined ? 1 : xyz.y;
            _z = xyz.z == undefined ? 1 : xyz.z;
            $._memoLevel = 0;
            return $;
        };

        $.getXYZ = function() {
            return {
                x: _x,
                y: _y,
                z: _z
            };
        };

        var init = function(params) {
            $.setXYZ({x : params.x, y: params.y, z: params.z });
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
                _mat = SceneJS_math_scalingMat4v([_x, _y, _z]);
            }
            var superXform = SceneJS_modelTransformModule.getTransform();
            if ($._memoLevel < 2) {
                var tempMat = SceneJS_math_mulMat4(superXform.matrix, _mat);
                _xform = {
                    localMatrix: _mat,
                    matrix: tempMat,
                    fixed: superXform.fixed && cfg.fixed
                };
                if ($._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
                    $._memoLevel = 2;
                }
            }
            SceneJS_modelTransformModule.setTransform(_xform);
            $._renderChildren(traversalContext, data);
            SceneJS_modelTransformModule.setTransform(superXform);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
