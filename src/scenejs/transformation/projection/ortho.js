/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 */
SceneJS.ortho = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('projection');
    var projection;
    return SceneJS._utils.createNode(
            function(scope) {
                if (!projection || !cfg.fixed) {
                    var params = cfg.getParams(scope);
                    var volume = {
                        left: params.left || -1.0,
                        right: params.right || 1.0,
                        bottom: params.bottom || -1.0,
                        top: params.top || 1.0,
                        near: params.near || 0.1,
                        far: params.far || 100.0
                    };
                    var tempMat = SceneJS._math.orthoMat4c(
                            volume.left,
                            volume.right,
                            volume.bottom,
                            volume.top,
                            volume.near,
                            volume.far
                            );
                    projection = {
                        matrix: tempMat
                    };
                }
                var prevProjection = backend.getTransform();
                backend.setTransform(projection);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setTransform(prevProjection);
            });
};
