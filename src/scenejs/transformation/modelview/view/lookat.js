/**
 * Scene node that constructs a 'lookat' view transformation matrix and sets it on the current shader.
 */

(function() {

    function makeLookAt(ex, ey, ez,
                        cx, cy, cz,
                        ux, uy, uz) {
        var eye = $V([ex, ey, ez]);
        var center = $V([cx, cy, cz]);
        var up = $V([ux, uy, uz]);

        var z = eye.subtract(center).toUnitVector();
        var x = up.cross(z).toUnitVector();
        var y = z.cross(x).toUnitVector();

        var m = $M([
            [x.e(1), x.e(2), x.e(3), 0],
            [y.e(1), y.e(2), y.e(3), 0],
            [z.e(1), z.e(2), z.e(3), 0],
            [0, 0, 0, 1]
        ]);

        var t = $M([
            [1, 0, 0, -ex],
            [0, 1, 0, -ey],
            [0, 0, 1, -ez],
            [0, 0, 0, 1]
        ]);
        return m.x(t);
    }

    SceneJs.lookAt = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);

        var backend = SceneJs.backends.getBackend('model-view-transform');

        var cloneVec = function(v) {
            return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
        };

        var mat;
        var xform;

        return function(scope) {

            if (!mat || !cfg.fixed) { // Memoize matrix if node config is constant
                var params = cfg.getParams(scope);

                params.eye = params.eye ? cloneVec(params.eye) : { x: 0.0, y: 0.0, z: 0.0 };
                params.look = params.look ? cloneVec(params.look) : { x: 0.0, y: 0.0, z: 0.0 };
                params.up = params.up ? cloneVec(params.up) : { x: 0.0, y: 1.0, z: 0.0 };

                if (params.eye.x == params.look.x && params.eye.y == params.look.y && params.eye.z == params.look.z) {
                    throw new SceneJs.exceptions.InvalidLookAtConfigException("Invald lookAt parameters: eye and look cannot be identical");
                }
                if (params.up.x == 0 && params.up.y == 0 && params.up.z == 0) {
                    throw new SceneJs.exceptions.InvalidLookAtConfigException("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero");
                }
                mat = makeLookAt(
                        params.eye.x, params.eye.y, params.eye.z,
                        params.look.x, params.look.y, params.look.z,
                        params.up.x, params.up.y, params.up.z);
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