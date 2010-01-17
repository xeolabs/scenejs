/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */

(function() {


    SceneJs.perspective = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection_transform');
        var xform;

        return function(scope) {
            if (!xform || !cfg.fixed) {
                var params = cfg.getParams(scope);

                params.fovy = params.fovy || 60.0;  // TODO: validate params
                params.aspect = params.aspect || 1.0;
                params.near = params.near || 0.1;
                params.far = params.far || 400.0;

                var tempMat = SceneJs.math.perspectiveMatrix4(
                        params.fovy* Math.PI / 180.0,
                        params.aspect,
                        params.near,
                        params.far);

                xform = {
                    matrix:tempMat
                };
            }
            var prevXform = backend.getTransform();
            backend.setTransform(xform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(prevXform);
        };
    };
})();
