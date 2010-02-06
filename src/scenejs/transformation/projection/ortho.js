/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 */
(function() {

    SceneJs.ortho = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection');
        var projection;
        return function(scope) {
            if (!projection || !cfg.fixed) {
                var params = cfg.getParams(scope);
                var volume = {
                    left: params.left || -1.0,
                    right: params.right || 1.0,
                    bottom: params.bottom || -1.0,
                    top: params.top || 1.0,
                    near: params.near || 0.1,
                    far: params.far || 100.0
                };
                var tempMat = SceneJs.math.orthoMat4c(
                        volume.left,
                        volume.right,
                        volume.bottom,
                        volume.top,
                        volume.near,
                        volume.far
                        );
                projection = {
                    matrix: tempMat,
                    volume: volume
                };
            }
            var prevProjection = backend.getProjection();
            backend.setProjection(projection);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setProjection(prevProjection);
        };
    };
})();