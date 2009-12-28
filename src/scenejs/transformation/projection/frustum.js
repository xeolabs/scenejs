/**
 * Scene node that constructs a projection matrix from a frustum and sets it on the current shader.
 */

(function() {

    function makeFrustum(left, right,
                         bottom, top,
                         znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);

        return $M([
            [X, 0, A, 0],
            [0, Y, B, 0],
            [0, 0, C, D],
            [0, 0, -1, 0]
        ]);
    }

    SceneJs.frustum = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection-transform');
        var mat;
        return function(scope) {
            if (!mat || cfg.fixed) {    // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);
                mat = makeFrustum(
                        params.left || -1.0,
                        params.right || 1.0,
                        params.bottom || -1.0,
                        params.top || 1.0,
                        params.near || 0.1,
                        params.far || 100.0
                        );
            }
            var prevMat = backend.getMatrix();
            backend.setMatrix(mat);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setMatrix(prevMat);
        };
    };

})();