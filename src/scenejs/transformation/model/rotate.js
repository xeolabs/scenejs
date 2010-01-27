/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJs.rotate = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('model-transform');

    var mat;
    var xform;

    return function(scope) {
        if (!mat || !cfg.fixed) { // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);
            params.angle = params.angle || 0;
            params.x = params.x || 0;
            params.y = params.y || 0;
            params.z = params.z || 0;
            if (params.x + params.y + params.z == 0) {
                throw new SceneJs.exceptions.IllegalRotateConfigException('Rotate vector is zero - at least one of x,y and z must be non-zero');
            }
            mat = SceneJs.math.rotationMat4v(params.angle * Math.PI / 180.0, [params.x, params.y, params.z]);
        }
        var superXform = backend.getTransform();
        if (!xform || !superXform.fixed || !cfg.fixed) {
            var tempMat = SceneJs.math.mulMat4(superXform.matrix, mat);
            xform = {
                localMatrix: mat,
                matrix: tempMat,              
                fixed: superXform.fixed && cfg.fixed
            };
        }
        backend.setTransform(xform);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setTransform(superXform);
    };
};
