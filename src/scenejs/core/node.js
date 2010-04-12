/** Basic scene graph node, generally used as a group node.
 */
SceneJS.node = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(traversalContext, data) {
                var params = cfg.getParams();
                var childScope = SceneJS._utils.newScope(data, false);
                if (params) {
                    for (var key in params) {
                        childScope.put(key, params[key]);
                    }
                }
                SceneJS._utils.visitChildren(cfg, traversalContext, childScope || data);
            });
};
