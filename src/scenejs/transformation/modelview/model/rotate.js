/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJs.rotate = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('mvp-transform');

    var mat;
    var xform;

    return function(scope) {
        if (!mat || !cfg.fixed) { // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);
            params.x = params.x || 0;
            params.y = params.y || 0;
            params.z = params.z || 0;
            if (params.x + params.y + params.z == 0) {
                throw new SceneJs.exceptions.IllegalRotateConfigException('Rotate vector is zero - at least one of x,y and z must be non-zero');
            }
            mat = SceneJs.utils.Matrix4.createRotate(params.angle || 0.0, params.x, params.y, params.z);
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
