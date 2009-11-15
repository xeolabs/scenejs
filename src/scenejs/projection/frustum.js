/**
 * Scene node that constructs a projection matrix from a frustum and sets it on the current shader.
 */
SceneJs.frustum = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('projection');

    var mat;

    return function(scope) {

        if (!mat || cfg.fixed) {    // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);
            mat = SceneJs.utils.Matrix4.createFrustum(
                    params.left || -1.0,
                    params.right || 1.0,
                    params.top || 1.0,
                    params.bottom || -1.0,
                    params.near || 0.1,
                    params.far || 100.0
                    );
        }

        var previousMat = backend.getProjectionMatrix();

        backend.setProjectionMatrix(mat);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setProjectionMatrix(previousMat);
    };
};


