/**
 * Scene node that creates a data scope for sub-nodes.
 */
SceneJs.scope = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var childScope;

    return function(scope) {
        if (!childScope || !cfg.fixed || !scope.isfixed()) { // memoize scope if config and scope are constant 
            var params = cfg.getParams(scope);
            childScope = SceneJs.private.newScope(scope, cfg.fixed);
            for (var key in params) {
                childScope.put(key, params[key]);
            }
        }
        SceneJs.private.visitChildren(cfg, childScope);
    };
};


