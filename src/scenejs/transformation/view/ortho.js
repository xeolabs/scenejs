/**
 * Scene node that constructs an ortographic transform matrix and sets it on the current shader.
 */
(function() {

    SceneJs.ortho = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('viewprojection');
        var transform;
        return function(scope) {
            if (!transform || !cfg.fixed) {
                var params = cfg.getParams(scope);
                var volume = {
                    left: params.left || -1.0,
                    right: params.right || 1.0,
                    bottom: params.bottom || -1.0,
                    top: params.top || 1.0,
                    near: params.near || 0.1,
                    far: params.far || 100.0
                };
                var tempMat = SceneJS_math_orthoMat4c(
                        volume.left,
                        volume.right,
                        volume.bottom,
                        volume.top,
                        volume.near,
                        volume.far
                        );
                transform = {
                    matrix: tempMat,
                    frustum : new SceneJS_math_Frustum(tempMat),
                    volume: volume
                };
            }
            var prevTransform = backend.getTransform();
            backend.setTransform(transform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(prevTransform);
        };
    };
})();