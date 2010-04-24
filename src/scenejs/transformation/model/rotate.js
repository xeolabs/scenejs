/**
 * Scene node that applies a model-space rotation transform to the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.scale
 * @extends SceneJS.node
 */
SceneJS.rotate = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {

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
        $.setAngle = function(angle) {
            _angle = angle || 0;
            $._memoLevel = 0;
            return $;
        };

        /** Returns the angle of rotation
         * @returns {double} The angle in degrees
         */
        $.getAngle = function() {
            return _angle;
        };

        /**
         * Sets the vector about which rotation occurs. The elements of the vector must not all be zero.
         * @param {object} vector The vector - eg. {x: 0, y: 1, z: 0}
         * @returns This node
         */
        $.setXYZ = function(xyz) {
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
            $._memoLevel = 0;
            return $;
        };

        /** Returns the vector about which rotation occurs
         * @returns {object} the vector, eg. {x: 0, y: 1, z: 0}
         */
        $.getXYZ = function() {
            return {
                x: _x,
                y: _y,
                z: _z
            };
        };

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

        var init = function(params) {
            if (params.angle) {
                $.setAngle(params.angle);
            }
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
                _mat = SceneJS_math_rotationMat4v(_angle * Math.PI / 180.0, [_x, _y, _z]);
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
            $._renderChildren(traversalContext, data);
            SceneJS_modelTransformModule.setTransform(superXform);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};