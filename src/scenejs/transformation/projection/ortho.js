/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 */
SceneJs.ortho = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend('mvp-transform');
    var mat;
    var xform;
    return function(scope) {
        if (!mat || !cfg.fixed) {
            var params = cfg.getParams(scope);
            mat = makeOrtho(
                    params.left || -1.0,
                    params.right || 1.0,
                    params.bottom || -1.0,
                    params.top || 1.0,
                    params.near || 0.1,
                    params.far || 100.0
                    );
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


