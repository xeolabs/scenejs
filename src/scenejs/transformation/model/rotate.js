/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJS.rotate = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var backend = SceneJS._backends.getBackend('model-transform');

    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!mat || !cfg.fixed) { // Memoize matrix if node config is constant
                    var params = cfg.getParams(scope);
                    params.angle = params.angle || 0;
                    params.x = params.x || 0;
                    params.y = params.y || 0;
                    params.z = params.z || 0;
                    if (params.x + params.y + params.z == 0) {
                        throw new SceneJS.exceptions.IllegalRotateConfigException('Rotate vector is zero - at least one of x,y and z must be non-zero');
                    }
                    mat = SceneJS._math.rotationMat4v(params.angle * Math.PI / 180.0, [params.x, params.y, params.z]);
                }
                var superXform = backend.getTransform();
                if (!xform || !superXform.fixed || !cfg.fixed) {
                    var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                    xform = {
                        localMatrix: mat,
                        matrix: tempMat,
                        fixed: superXform.fixed && cfg.fixed
                    };
                }
                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setTransform(superXform);
            });
};
