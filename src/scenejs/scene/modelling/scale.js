SceneJs.scale = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backend.getBackend('viewtransform');

    var localMat;
    var modelTransform;

    return function(scope) {
        if (!localMat || !cfg.cachable) {
            var params = cfg.getParams(scope);
            localMat = SceneJs.utils.Matrix4.createScale(params.x || 0, params.y || 0, params.z || 0);
        }
        var xform = backend.getModelTransform();

        if (!modelTransform || !xform.cacheSafe) {
            modelTransform = {
                matrix: xform.matrix.multiply(localMat),
                cached: xform.cacheSafe && cfg.cachable
            };
        }

        backend.setModelTransform(modelTransform);
        SceneJs.private.visitChildren(cfg, scope);
        backend.setModelTransform(xform);
    };
};

