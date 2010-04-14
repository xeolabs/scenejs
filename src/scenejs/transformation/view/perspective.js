/**
 * Scene node that constructs a perspective transform matrix and sets it on the current shader.
 */

(function() {


    SceneJS.perspective = function() {
        var cfg = SceneJS.utils.getNodeConfig(arguments);
        var backend = SceneJS._backends
            return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
        };
.getBackend('viewprojection');
        var transform;

        return function(scope) {
            if (!transform || !cfg.fixed) {
                var params = cfg.getParams(scope);
                var tempMat = SceneJS_math_perspectiveMatrix4(
                        (params.fovy || 60.0) * Math.PI / 180.0,
                        params.aspect || 1.0,
                        params.near || 0.1,
                        params.far || 400.0);

                transform = {
                    matrix:tempMat,
                    frustum: new SceneJS_math_Frustum(tempMat)
                };
            }
            var prevTransform = backend.getTransform();
            backend.setTransform(transform);
            SceneJS.utils.visitChildren(cfg, scope);
            backend.setTransform(prevTransform);
        };
    };
})();
