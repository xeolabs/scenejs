/** Basic scene graph node. If the config contains any members, then they will be within scope for
 * child nodes.
 */
SceneJS.node = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(scope) {
                var params = cfg.getParams();
                var childScope = SceneJS._utils.newScope(scope, false);
                if (params) {
                    for (var key in params) {
                        childScope.put(key, params[key]);
                    }
                }
                SceneJS._utils.visitChildren(cfg, childScope || scope);
            });
};
