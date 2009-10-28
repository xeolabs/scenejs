/**
 * Modelling rotation transformation node.
 */
SceneJs.rotate = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backendModules.getBackend('viewtransform');
    
    var localMat;
    var modelTransform;

    return function(scope) {
        if (!localMat || !cfg.cachable) {
            var params = cfg.getParams(scope);
            params.x = params.x || 0;
            params.y = params.y || 0;
            params.z = params.z || 0;
            if (params.x + params.y + params.z == 0) {
                throw 'rotate vector is zero - at least one of x,y and z must be non-zero';
            }
            localMat = SceneJs.utils.Matrix4.createRotate(params.angle || 0.0, params.x, params.y, params.z);
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
