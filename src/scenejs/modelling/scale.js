/**
 * Sets a scaling modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
SceneJs.scale = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('modeltransform');

    var localMat;
    var modelTransform;

    return function(scope) {
        if (!localMat || !cfg.fixed) {   // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);
            localMat = SceneJs.utils.Matrix4.createScale(params.x || 0, params.y || 0, params.z || 0);
        }
        var xform = backend.getModelTransform();
         if (!modelTransform || !xform.fixed) { // Multiply by current model matrix, memoize if current matrix is constant
            modelTransform = {
                matrix: localMat.multiply(xform.matrix),      
                fixed: xform.fixed && cfg.fixed
            };
        }
        backend.setModelTransform(modelTransform);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setModelTransform(xform);
    };
};

