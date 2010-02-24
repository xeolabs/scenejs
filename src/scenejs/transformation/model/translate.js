/**
 * Sets a translation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJS.translate = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var backend = SceneJS._backends.getBackend('model-transform');

    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!mat || !cfg.fixed) {  // Memoize matrix if node config is constant
                    var params = cfg.getParams(scope);
                    mat = SceneJS._math.translationMat4v([params.x || 0, params.y || 0, params.z || 0]);
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
