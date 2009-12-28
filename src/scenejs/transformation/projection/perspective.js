/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
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

    function makePerspective(fovy, aspect, znear, zfar) {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
    }

    SceneJs.perspective = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection-transform');
        var mat;

        return function(scope) {
            if (!mat || !cfg.fixed) {
                var params = cfg.getParams(scope);

                params.fovy = params.fovy || 60.0;  // TODO: validate params
                params.aspect = params.aspect || 1.0;
                params.near = params.near || 0.1;
                params.far = params.far || 400.0;

                mat = makePerspective(
                        params.fovy,
                        params.aspect,
                        params.near,
                        params.far);
            }
            var prevMat = backend.getMatrix();
            backend.setMatrix(mat);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setMatrix(prevMat);
        };
    };
})();
