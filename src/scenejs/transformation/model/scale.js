/**
 * Sets a scaling modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */

(function() {

    SceneJs.scale = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);

        var backend = SceneJs.backends.getBackend('model-transform');

        var mat;
        var xform;

        return function(scope) {
            if (!mat || !cfg.fixed) {   // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);
                mat = SceneJs.math.scalingMat4v([params.x || 0, params.y || 0, params.z || 0]);
            }
            var superXform = backend.getTransform();
            if (!xform || !superXform.fixed || !cfg.fixed) {
                var tempMat = SceneJs.math.mulMat4(superXform.matrix, mat);
                xform = {
                    matrix: tempMat,                   
                    fixed: superXform.fixed && cfg.fixed
                };
            }
            backend.setTransform(xform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(superXform);
        };
    };
})();

