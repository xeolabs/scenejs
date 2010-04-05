/**
 * Sets a translation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
(function() {

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    var backend = SceneJS._backends.getBackend('model-transform');

    SceneJS.translate = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var mat;
        var xform;
        var memoLevel = NO_MEMO;

        return SceneJS._utils.createNode(
                function(traversalContext, data) {
                    if (memoLevel == NO_MEMO) {
                        var params = cfg.getParams(data);
                        mat = SceneJS._math.translationMat4v([params.x || 0, params.y || 0, params.z || 0]);
                    }
                    var superXform = backend.getTransform();
                    if (memoLevel < FIXED_MODEL_SPACE) {
                        var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
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
})();
