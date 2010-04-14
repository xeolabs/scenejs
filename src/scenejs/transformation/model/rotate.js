/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */

(function() {
    var backend = SceneJS._backends.getBackend('model-transform');
    var errorBackend = SceneJS._backends.getBackend('error');

    SceneJS.rotate = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);

        /* Memoization levels
         */
        const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
        const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
        const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

        var memoLevel = NO_MEMO;
        var mat;
        var xform;

        return SceneJS._utils.createNode(
                function(traversalContext, data) {
                    if (memoLevel == NO_MEMO) {
                        var params = cfg.getParams(data);
                        params.angle = params.angle || 0;
                        params.x = params.x || 0;
                        params.y = params.y || 0;
                        params.z = params.z || 0;
                        if (params.x + params.y + params.z == 0) {
                            errorBackend.fatalError(
                                    new SceneJS.exceptions.IllegalRotateConfigException(
                                            "SceneJS.rotate vector is zero - at least one of properties x,y and z must be non-zero"));
                        }
                        mat = SceneJS_math_rotationMat4v(params.angle * Math.PI / 180.0, [params.x, params.y, params.z]);
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
})();