/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */

(function() {


    SceneJs.perspective = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var backend = SceneJs.backends.getBackend('projection');
        var projection;

        return function(scope) {
            if (!projection || !cfg.fixed) {
                var params = cfg.getParams(scope);

                var fovy = params.fovy || 60.0;  // TODO: validate params
                var aspect = params.aspect || 1.0;
                var znear = params.near || 0.1;
                var zfar = params.far || 400.0;

               var tempMat = SceneJs.math.perspectiveMatrix4(
                        params.fovy* Math.PI / 180.0,
                        params.aspect,
                        params.near,
                        params.far);


	var ymax = znear * Math.tan(fovy * 0.00872664625972);
	var ymin = -ymax;
	var xmin = ymin * aspect;
	var xmax = ymax * aspect;

                var volume = {
                    xmin: xmin,
                    ymin: ymin,
                    zmin: znear,
                    xmax: xmax,
                    ymax: ymax,
                    zmax: zfar
                };

                projection = {
                    matrix:tempMat,
                    volume: volume
                };
            }
            var prevProjection = backend.getProjection();
            backend.setProjection(projection);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setProjection(prevProjection);
        };
    };
})();
