/**

 */
SceneJS.stationary = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('view-transform');
    var xform;
    return SceneJS._utils.createNode(
            function(data) {
                var superXform = backend.getTransform();
                var lookAt = superXform.lookAt;
                if (lookAt) {
                    if (!lookAt || !superXform.fixed) {
                        xform = {
                            matrix: SceneJS._math.mulMat4(
                                    superXform.matrix,
                                    SceneJS._math.translationMat4c(
                                            lookAt.eye.x,
                                            lookAt.eye.y,
                                            lookAt.eye.z)),
                            lookAt: lookAt,
                            fixed: superXform.fixed
                        };
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setTransform(superXform);
                } else {
                    SceneJS._utils.visitChildren(cfg, data);
                }
            });
};

