/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */

SceneJs.perspective = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend('mvp-transform');
    var mat;
    var xform;

    return function(scope) {

        if (!mat || !cfg.fixed) {
            var params = cfg.getParams(scope);

            params.fovy = params.fovy || 60.0;  // TODO: validate params
            params.aspect = params.aspect || 1.0;
            params.near = params.near || 0.1;
            params.far = params.far || 400.0;

            mat = makePerspective(
                    params.fovy,
                    params.aspect,
                    params.near,
                    params.far);
        }
        var superXform = backend.getTransform();
        if (!xform || !superXform.fixed || !cfg.fixed) {
            xform = {
                matrix: superXform.matrix.x(mat),
                fixed: superXform.fixed && cfg.fixed
            };
        }
        backend.setTransform(xform);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setTransform(superXform);
    };
};
