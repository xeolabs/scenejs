/**
 * Scene node that defines a perspective transformation for the nodes within its subgraph.
 *
 * @class SceneJS.perspective
 * @extends SceneJS.node
 */
SceneJS.perspective = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {
        $._fovy = 60.0;
        $._aspect = 1.0;
        $._near = 0.1;
        $._far = 400.0;
        $._transform = null;

        $.setFovY = function(fovy) {
            $._fovy = fovy;
            $._memoLevel = 0;
        };

        $.getFovyY = function() {
            return $._fovy;
        };

        $.setAspect = function(aspect) {
            $._aspect = aspect;
            $._memoLevel = 0;
        };

        $.getAspect = function() {
            return $._aspect;
        };

        $.setNear = function(near) {
            $._near = near;
            $._memoLevel = 0;
        };

        $.getNear = function() {
            return $._near;
        };

        $.setFar = function(far) {
            $._far = far;
            $._memoLevel = 0;
        };

        $.getFar = function() {
            return $._far;
        };

        $._init = function(params) {
            if (params.fovy) {
                $.setFovY(params.fovy);
            }
            if (params.aspect) {
                $.setAspect(params.aspect);
            }
            if (params.near) {
                $.setNear(params.near);
            }
            if (params.far) {
                $.setFar(params.far);
            }
        };

        if (cfg.fixed) {
            $._init(cfg.getParams());
        }

        // Override
        $._render = function(traversalContext, data) {
            if ($._memoLevel == 0) {
                if (!cfg.fixed) {
                    $._init(cfg.getParams(data));
                } else {
                    $._memoLevel = 1;
                }
                var tempMat = SceneJS_math_perspectiveMatrix4(
                        $._fovy * Math.PI / 180.0,
                        $._aspect,
                        $._near,
                        $._far);
                $._transform = {
                    type: "perspective",
                    matrix:tempMat
                };
            }
            var prevTransform = SceneJS_projectionModule.getTransform();
            SceneJS_projectionModule.setTransform($._transform);
            this._renderChildren(traversalContext, data);
            SceneJS_projectionModule.setTransform(prevTransform);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};

