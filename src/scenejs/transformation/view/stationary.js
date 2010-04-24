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

    /* Augment the basic node type
     */
    return (function($) {

        var xform;

        $._render = function(traversalContext, data) {
            var superXform = SceneJS_viewTransformModule.getTransform();
            var lookAt = superXform.lookAt;
            if (lookAt) {
                if ($._memoLevel == 0) {
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
                    if (superXform.fixed) {
                        $._memoLevel = 1;
                    }
                }
                SceneJS_viewTransformModule.setTransform(xform);
                $._renderChildren(traversalContext, data);
                SceneJS_viewTransformModule.setTransform(superXform);
            } else {
                $._renderChildren(traversalContext, data);
            }
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
