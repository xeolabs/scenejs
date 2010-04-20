/**
 * Node that defines a view transform matrix for its subgraph.
 */
SceneJS.viewMatrix = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing matrix
    const FIXED_VIEW_SPACE = 2;     // Both node config and view-space are fixed

    var backend = SceneJS._backends.getBackend('view-transform');

    var memoLevel = NO_MEMO;
    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(traversalContext, data) {

                if (memoLevel == NO_MEMO) {
                    var params = cfg.getParams(data);
                    mat = params.elements || SceneJS_math_identityMat4();
                    if (cfg.fixed) {

                        /* Config fixed - bump memo level
                         */
                        memoLevel = FIXED_CONFIG;
                    }
                }

                var superXform = backend.getTransform();

                if (memoLevel < FIXED_VIEW_SPACE) {
                    var tempMat = SceneJS_math_mulMat4(superXform.matrix, mat);
                    xform = {
                        type: "matrix",
                        matrix: tempMat,
                        fixed: superXform.fixed && cfg.fixed
                    };

                    if (memoLevel == FIXED_CONFIG && superXform.fixed) {

                        /* Super view xform fixed - bump memo level again - memoize everything!
                         */
                        memoLevel = FIXED_VIEW_SPACE;
                    }
                }

                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                backend.setTransform(superXform);
            });
};
