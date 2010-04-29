/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 */
SceneJS.ortho = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
   
    var transform;

    return SceneJS._utils.createNode(
            "ortho",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {
                    if (!transform || !cfg.fixed) {
                        var params = cfg.getParams(data);
                        var volume = {
                            left: params.left || -1.0,
                            right: params.right || 1.0,
                            bottom: params.bottom || -1.0,
                            top: params.top || 1.0,
                            near: params.near || 0.1,
                            far: params.far || 100.0
                        };
                        var tempMat = SceneJS_math_orthoMat4c(
                                volume.left,
                                volume.right,
                                volume.bottom,
                                volume.top,
                                volume.near,
                                volume.far
                                );
                        transform = {
                            type: "ortho",
                            matrix: tempMat
                        };
                    }
                    var prevTransform = SceneJS_projectionModule.getTransform();
                    SceneJS_projectionModule.setTransform(transform);
                    this._renderNodes(traversalContext, data);
                    SceneJS_projectionModule.setTransform(prevTransform);
                };
            })());
};
