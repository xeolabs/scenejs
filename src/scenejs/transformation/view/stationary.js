/**
 * Scene node that defines a region within the current view space in which the translations specified by a higher
 * SceneJS.lookAt node have no effect. As the parameters of the SceneJS.lookAt are modified, the content in the subgraph
 * of this node will rotate about the eye position, but will not translate as the eye position moves. You could therefore
 * define a skybox within the subgraph of this node, that will always stay in the distance.
 *
 * @class SceneJS.stationary
 * @extends SceneJS.node
 */
SceneJS.stationary = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
   
    return SceneJS._utils.createNode(
            "stationary",
            cfg.children,

            new (function() {

                var xform;

                this._render = function(traversalContext, data) {
                    var superXform = SceneJS_viewTransformModule.getTransform();
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
                        SceneJS_viewTransformModule.setTransform(xform);
                        this._renderChildren(traversalContext, data);
                        SceneJS_viewTransformModule.setTransform(superXform);
                    } else {
                        this._renderChildren(traversalContext, data);
                    }
                };
            })());
};

