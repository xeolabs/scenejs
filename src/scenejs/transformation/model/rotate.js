/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */

SceneJS.rotate = function() {
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
            function(data) {
                if (memoLevel == NO_MEMO) {
                    var params = cfg.getParams(data);
                    params.angle = params.angle || 0;
                    params.x = params.x || 0;
                    params.y = params.y || 0;
                    params.z = params.z || 0;
                    if (params.x + params.y + params.z == 0) {
                        throw new SceneJS.exceptions.IllegalRotateConfigException('Rotate vector is zero - at least one of x,y and z must be non-zero');
                    }
                    mat = SceneJS._math.rotationMat4v(params.angle * Math.PI / 180.0, [params.x, params.y, params.z]);
                    if (cfg.fixed) {
                        memoLevel = FIXED_CONFIG;
                    }
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
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(superXform);
            });
};
