/**

 */
SceneJS.billboard = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var vxfBackend = SceneJS._backends.getBackend('view-transform');
    var mxfBackend = SceneJS._backends.getBackend('model-transform');
    return SceneJS._utils.createNode(
            function(traversalContext, data) {

                var viewXform = vxfBackend.getTransform();
                var modelXform = vxfBackend.getTransform();

                //var mat = SceneJS_math_rotationMat4v(12 * Math.PI / 180.0, [0, 1, 0]);
                    var mat = SceneJS_math_billboardMat(viewXform.matrix);

                var xform = {
                    localMatrix: mat,
                    matrix: SceneJS_math_mulMat4(modelXform.matrix, mat),
                    fixed: false
                };

                mxfBackend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                mxfBackend.setTransform(modelXform);
            });
};

