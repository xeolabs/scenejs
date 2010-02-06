/**
 * Scene node that specifies the current viewing volume and projection matrix
 */

(function() {
    SceneJs.frustum = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection');
        var projection;
        return function(scope) {
            if (!projection || cfg.fixed) {    // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);
                var volume = {
                    xmin: params.left || -1.0,
                    xmax: params.right || 1.0,
                   ymin: params.bottom || -1.0,
                    ymax: params.top || 1.0,
                    zmin: params.near || 0.1,
                    zmax: params.far || 100.0
                };
                var tempMat = SceneJs.math.frustumMatrix4(
                        volume.xmin,
                        volume.xmax,
                        volume.ymin,
                        volume.ymax,
                        volume.zmin,
                        volume.zmax
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