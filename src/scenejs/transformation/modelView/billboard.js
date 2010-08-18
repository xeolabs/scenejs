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

                    var viewXform = SceneJS._viewTransformModule.getTransform();
                    var modelXform = SceneJS._viewTransformModule.getTransform();

                    var mat = SceneJS._math_billboardMat(viewXform.matrix);

                    var xform = {
                        localMatrix: mat,
                        matrix: SceneJS._math_mulMat4(modelXform.matrix, mat),
                        fixed: false
                    };
                    SceneJS._modelTransformModule.setTransform(xform);
                    this._renderNodes(traversalContext, data);
                    SceneJS._modelTransformModule.setTransform(modelXform);
                };
            })());
};

SceneJS.registerNodeType("billboard", SceneJS.billboard);

