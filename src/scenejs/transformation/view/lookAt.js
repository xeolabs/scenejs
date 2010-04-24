/**
 * Scene node that defines a "look at" viewing transformation for the nodes within its subgraph.
 *
 * @class SceneJS.lookAt
 * @extends SceneJS.node
 */
(function() {
    SceneJS.lookAt = function() {

        var cfg = SceneJS._utils.getNodeConfig(arguments);

        /* Augment the basic node type
         */
        return (function($) {

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

            $.setEye = function(eye) {
                _eyeX = eye.x || 0;
                _eyeY = eye.y || 0;
                _eyeZ = eye.z || 0;
                $._memoLevel = 0;
                return $;
            };

            $.getEye = function() {
                return {
                    x: _eyeX,
                    y: _eyeY,
                    z: _eyeZ
                };
            };

            $.setLook = function(look) {
                _lookX = look.x || 0;
                _lookY = look.y || 0;
                _lookZ = look.z || 0;
                $._memoLevel = 0;
                return $;
            };

            $.getLook = function() {
                return {
                    x: _lookX,
                    y: _lookY,
                    z: _lookZ
                };
            };

            $.setUp = function(up) {
                var x = up.x || 0;
                var y = up.y || 0;
                var z = up.z || 0;
                if (x + y + z == 0) {
                    SceneJS_errorModule.fatalError(
                            new SceneJS.exceptions.IllegalRotateConfigException(
                                    "SceneJS.lookAt up vector is zero length - at least one of its x,y and z components must be non-zero"));
                }
                _upX = x;
                _upY = y;
                _upZ = z;
                $._memoLevel = 0;
                return $;
            };

            $.getUp = function() {
                return {
                    x: _upX,
                    y: _upY,
                    z: _upZ
                };
            };

            function _init(params) {
                if (params.eye) {
                    $.setEye(params.eye);
                }
                if (params.look) {
                    $.setLook(params.look);
                }
                if (params.up) {
                    $.setUp(params.up);
                }
            };

            if (cfg.fixed) {
                _init(cfg.getParams());
            }

            $._render = function(traversalContext, data) {
                if ($._memoLevel == 0) {
                    if (!cfg.fixed) {
                        _init(cfg.getParams(data));
                    } else {
                        $._memoLevel = 1;
                    }
                    _mat = SceneJS_math_lookAtMat4c(
                            _eyeX, _eyeY, _eyeZ,
                            _lookX, _lookY, _lookZ,
                            _upX, _upY, _upZ);
                }
                var superXform = SceneJS_viewTransformModule.getTransform();
                if ($._memoLevel < 2) {
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
                    if ($._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if space fixed
                        $._memoLevel = 2;
                    }
                }
                SceneJS_viewTransformModule.setTransform(xform);
                $._renderChildren(traversalContext, data);
                SceneJS_viewTransformModule.setTransform(superXform);
            };
            return $;
        })(SceneJS.node.apply(this, arguments));
    };
})();