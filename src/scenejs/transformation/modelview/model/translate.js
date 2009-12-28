/**
 * Sets a translation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
(function() {

    function makeTranslate(x, y, z) {
        return Matrix.create([
            [ 1, 0, 0, x ],
            [ 0, 1, 0, y ],
            [ 0, 0, 1, z ],
            [ 0, 0, 0, 1 ]
        ]);
    }

    SceneJs.translate = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);

        var backend = SceneJs.backends.getBackend('model-view-transform');

        var mat;
        var xform;

        return function(scope) {
            if (!mat || !cfg.fixed) {  // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);
                mat = makeTranslate(params.x || 0, params.y || 0, params.z || 0);
            }
            var superXform = backend.getTransform();
            if (!xform || !superXform.fixed || !cfg.fixed) {
                var tempMat = superXform.matrix.x(mat);
                xform = {
                    matrix: tempMat,
                    normalMatrix:tempMat.inverse().transpose().make3x3(),
                    fixed: superXform.fixed && cfg.fixed
                };
            }
            backend.setTransform(xform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(superXform);
        };
    };
})();