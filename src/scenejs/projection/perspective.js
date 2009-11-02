/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */
SceneJs.perspective = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backendModules.getBackend('projection');

    var mat;

    return function(scope) {

        if (!mat || !cfg.fixed) {
            var params = cfg.getParams(scope);

            params.fovy = params.fovy || 60.0;
            params.aspect = params.aspect || 1.0;
            params.near = params.near || 0.1;
            params.far = params.far || 400.0;
            var frustumH = Math.tan((params.fovy / 360.0 * Math.PI) * params.near);
            var frustumW = frustumH * params.aspect;

            mat = SceneJs.utils.Matrix4.createFrustum(
                    -frustumW,
                    frustumW,
                    -frustumH,
                    frustumH,
                    params.near,
                    params.far
                    );
        }

       var previousMat = backend.getProjectionMatrix();

        backend.setProjectionMatrix(mat);
        SceneJs.private.visitChildren(cfg, scope);
        backend.setProjectionMatrix(previousMat);
    };
};
