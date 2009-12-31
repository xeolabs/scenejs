/**
 * Sets a scaling modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */

(function() {

    function makeScale(x, y, z) {
        return Matrix.create([
            [ x, 0, 0, 0 ],
            [ 0, y, 0, 0 ],
            [ 0, 0, z, 0 ],
            [ 0, 0, 0, 1 ]
        ]);
    }

    SceneJs.scale = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);

        var backend = SceneJs.backends.getBackend('model-view-transform');

        var mat;
        var xform;

        return function(scope) {
            if (!mat || !cfg.fixed) {   // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);
                mat = makeScale(params.x || 0, params.y || 0, params.z || 0);
            }
            var superXform = backend.getTransform();
            if (!xform || !superXform.fixed || !cfg.fixed) {
                var tempMat = superXform.matrix.x(mat);
                xform = {
                    matrix: tempMat,
                    normalMatrixAsArray : new WebGLFloatArray(tempMat.inverse().transpose().make3x3().flatten()),
                matrixAsArray : new WebGLFloatArray(tempMat.flatten()),
                    fixed: superXform.fixed && cfg.fixed
                };
            }
            backend.setTransform(xform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(superXform);
        };
    };
})();

