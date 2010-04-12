/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
(function() {

    function defineNode(nodeName, backendName, createMatrix) {

        var backend = SceneJS._backends.getBackend(backendName);

        /* Memoization levels
         */
        const NO_MEMO = 0;        // No memoization, assuming that node's configuration is dynamic
        const FIXED_CONFIG = 1;   // Node config is fixed, memoizing local object-space matrix
        const FIXED_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

        SceneJS[nodeName] = function() {
            var cfg = SceneJS._utils.getNodeConfig(arguments);
            var memoLevel = NO_MEMO;
            var mat;
            var xform;
            return SceneJS._utils.createNode(
                    function(traversalContext, data) {
                        if (memoLevel == NO_MEMO) {
                            var params = cfg.getParams(data);
                            mat = createMatrix(params);
                            if (cfg.fixed) { // Node config fixed - bump up memoization level
                                memoLevel = FIXED_CONFIG;
                            }
                        }
                        var superXform = backend.getTransform();
                        if (memoLevel < FIXED_SPACE) {
                            var tempMat = SceneJS_math_mulMat4(superXform.matrix, mat);
                            xform = {
                                localMatrix: mat,
                                matrix: tempMat,
                                fixed: superXform.fixed && cfg.fixed
                            };
                            if (memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if space fixed
                                memoLevel = FIXED_SPACE;
                            }
                        }
                        backend.setTransform(xform);
                        SceneJS._utils.visitChildren(cfg, traversalContext, data);
                        backend.setTransform(superXform);
                    });
        };
    }

    defineNode("rotate",
            "model-transform",
            function(params) {
                params.angle = params.angle || 0;
                params.x = params.x || 0;
                params.y = params.y || 0;
                params.z = params.z || 0;
                if (params.x + params.y + params.z == 0) {
                    throw new SceneJS.exceptions.IllegalRotateConfigException('Rotate vector is zero - at least one of x,y and z must be non-zero');
                }
                return SceneJS_math_rotationMat4v(params.angle * Math.PI / 180.0, [params.x, params.y, params.z]);
            });

    defineNode("scale",
            "model-transform",
            function(params) {
                return SceneJS_math_scalingMat4v([params.x || 1, params.y || 1, params.z || 1]);
            });

    defineNode("translate",
            "model-transform",
            function(params) {
                return SceneJS_math_translationMat4v([params.x || 0, params.y || 0, params.z || 0]);
            });

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    defineNode("lookAt",
            "view-transform",
            function(params) {
                params.eye = params.eye ? cloneVec(params.eye) : { x: 0.0, y: 0.0, z: 0.0 };
                params.look = params.look ? cloneVec(params.look) : { x: 0.0, y: 0.0, z: 0.0 };
                params.up = params.up ? cloneVec(params.up) : { x: 0.0, y: 1.0, z: 0.0 };
                if (params.eye.x == params.look.x && params.eye.y == params.look.y && params.eye.z == params.look.z) {
                    throw new SceneJS.exceptions.InvalidLookAtConfigException
                            ("Invald lookAt parameters: eye and look cannot be identical");
                }
                if (params.up.x == 0 && params.up.y == 0 && params.up.z == 0) {
                    throw new SceneJS.exceptions.InvalidLookAtConfigException
                            ("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero");
                }
                return SceneJS_math_lookAtMat4c(
                        params.eye.x, params.eye.y, params.eye.z,
                        params.look.x, params.look.y, params.look.z,
                        params.up.x, params.up.y, params.up.z);
            });
})();
