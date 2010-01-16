/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 */
(function() {
   
    SceneJs.ortho = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection_transform');
        var xform;
        return function(scope) {
            if (!xform || !cfg.fixed) {
                var params = cfg.getParams(scope);
                var tempMat = SceneJs.math.orthoMat4c(
                        params.left || -1.0,
                        params.right || 1.0,
                        params.bottom || -1.0,
                        params.top || 1.0,
                        params.near || 0.1,
                        params.far || 100.0
                        );
                xform = {
                    matrix: tempMat
                };
            }
            var prevXform = backend.getTransform();
            backend.setTransform(xform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(prevXform);
        };
    };
})();