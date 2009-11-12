/** Basic scene graph node. If the config contains any members, then they will be within scope for
 * child nodes.
 */
SceneJs.node = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    return function(scope) {
        var params = cfg.getParams();
        var childScope = SceneJs.utils.newScope(scope, false);
        if (params) {
            for (var key in params) {
                childScope.put(key, params[key]);
            }
        }
        SceneJs.utils.visitChildren(cfg, childScope || scope);
    };
};
