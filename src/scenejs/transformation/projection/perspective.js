/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */

SceneJS.perspective = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('projection');
    var transform;

    return SceneJS._utils.createNode(
            function(traversalContext, data) {
                if (!transform || !cfg.fixed) {
                    var params = cfg.getParams(data);
                    var tempMat = SceneJS_math_perspectiveMatrix4(
                            (params.fovy || 60.0) * Math.PI / 180.0,
                            params.aspect || 1.0,
                            params.near || 0.1,
                            params.far || 400.0);

                    transform = {
                        matrix:tempMat
                    };
                }
                var prevTransform = backend.getTransform();
                backend.setTransform(transform);
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                backend.setTransform(prevTransform);
            });
};

