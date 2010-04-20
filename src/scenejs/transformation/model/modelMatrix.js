/**
 * Node that defines a modelling transform matrix for its subgraph.
 */

SceneJS.modelMatrix = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    var backend = SceneJS._backends.getBackend('model-transform');

    var memoLevel = NO_MEMO;
    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(traversalContext, data) {
                if (memoLevel == NO_MEMO) {
                    var params = cfg.getParams(data);
                    mat = params.elements || SceneJS_math_identityMat4();
                    if (cfg.fixed) {
                        memoLevel = FIXED_CONFIG;
                    }
                }
                var superXform = backend.getTransform();
                if (memoLevel < FIXED_MODEL_SPACE) {
                    var tempMat = SceneJS_math_mulMat4(superXform.matrix, mat);
                    xform = {
                        localMatrix: mat,
                        matrix: tempMat,
                        fixed: superXform.fixed && cfg.fixed
                    };
                    if (memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                        memoLevel = FIXED_MODEL_SPACE;
                    }
                }
                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                backend.setTransform(superXform);
            });
};
