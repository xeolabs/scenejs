/**
 * Sets a translation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJs.translate = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('mvp-transform');

    var mat;
    var xform;

    return function(scope) {
        if (!mat || !cfg.fixed) {  // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);
            mat = Matrix.Translation($V([params.x || 0, params.y || 0, params.z || 0])).ensure4x4();
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