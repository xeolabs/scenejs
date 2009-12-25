/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */
SceneJs.perspective = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('projection');

    var mat;

    return function(scope) {

        if (!mat || !cfg.fixed) {
            var params = cfg.getParams(scope);

            params.fovy = params.fovy || 60.0;  // TODO: validate params
            params.aspect = params.aspect || 1.0;
            params.near = params.near || 0.1;
            params.far = params.far || 400.0;

            mat = new SceneJs.utils.Matrix4();
            mat.perspective(
                    params.fovy,
                    params.aspect,
                    params.near,
                    params.far);
        }

        var previousMat = backend.getProjectionMatrix();

        backend.setProjectionMatrix(mat);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setProjectionMatrix(previousMat);
    };
};
