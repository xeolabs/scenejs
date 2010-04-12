/**

 */
SceneJS.stationary = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('view-transform');
    var xform;
    return SceneJS._utils.createNode(
            function(traversalContext, data) {
                var superXform = backend.getTransform();
                var lookAt = superXform.lookAt;
                if (lookAt) {
                    if (!xform || !superXform.fixed) {
                        xform = {
                            matrix: SceneJS_math_mulMat4(
                                    superXform.matrix,
                                    SceneJS_math_translationMat4c(
                                            lookAt.eye.x,
                                            lookAt.eye.y,
                                            lookAt.eye.z)),
                            lookAt: lookAt,
                            fixed: superXform.fixed
                        };
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                    backend.setTransform(superXform);
                } else {
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                }
            });
};

