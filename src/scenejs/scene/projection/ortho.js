SceneJs.ortho = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backend.getBackend('projection');

    var mat;

    return function(scope) {

        if (!mat || !cfg.cachable) {
            var params = cfg.getParams(scope);

            mat = SceneJs.utils.Matrix4.createOrtho(
                    params.left || -1.0,
                    params.right || 1.0,
                    params.top || 1.0,
                    params.bottom || -1.0,
                    params.near || 0.1,
                    params.far || 100.0
                    );
        }

        backend.setProjectionMatrix(mat);
        SceneJs.private.visitChildren(cfg, scope);
        backend.setProjectionMatrix();
    };
};

