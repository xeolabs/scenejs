/**
 * @private
 */
SceneJS.billboard = function() {
    var cfg = SceneJS.getNodeConfig(arguments);
    
    return SceneJS.createNode(
            "billboard",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {

                    var viewXform = SceneJS_viewTransformModule.getTransform();
                    var modelXform = SceneJS_viewTransformModule.getTransform();

                    var mat = SceneJS_math_billboardMat(viewXform.matrix);

                    var xform = {
                        localMatrix: mat,
                        matrix: SceneJS_math_mulMat4(modelXform.matrix, mat),
                        fixed: false
                    };
                    SceneJS_modelTransformModule.setTransform(xform);
                    this._renderNodes(traversalContext, data);
                    SceneJS_modelTransformModule.setTransform(modelXform);
                };
            })());
};

