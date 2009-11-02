/** Basic scene graph node. If the config contains any members, then they will be within scope for
 * child nodes.
 */
SceneJs.node = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    return function(scope) {
        var childScope;
        var params = cfg.getParams();
        for (var key in params) {
            if (!childScope) {
                childScope = SceneJs.private.newScope(scope, false); // TODO: how to determine fixed scope for cacheing??
            }
            childScope.put(key, params[key]);
        }
        SceneJs.private.visitChildren(cfg, childScope || scope);
    };
};
