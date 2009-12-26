/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJs.rotate = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('modeltransform');

    var localMat;
    var modelTransform;

    return function(scope) {
        if (!localMat || !cfg.fixed) { // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);
            params.x = params.x || 0;
            params.y = params.y || 0;
            params.z = params.z || 0;
            if (params.x + params.y + params.z == 0) {
                throw 'rotate vector is zero - at least one of x,y and z must be non-zero';
            }
            localMat = new SceneJs.utils.Matrix4();
            localMat.rotate(params.angle || 0.0, params.x, params.y, params.z);
        }

        var xform = backend.getModelTransform(); // Retain current model matrix

        if (!modelTransform || !xform.fixed) { // Multiply by current model matrix, memoize if current matrix is constant
            var mat = new SceneJs.utils.Matrix4(localMat);
            mat.multRight(xform.matrix);
            modelTransform = {
                matrix: mat,       // TODO: verify correct order
                fixed: xform.fixed && cfg.fixed
            };
        }

        backend.setModelTransform(modelTransform);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setModelTransform(xform);
    };
};
