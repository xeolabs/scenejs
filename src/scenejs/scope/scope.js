/**
 * Scene node that creates a child scope containing the elements of its configuration. 
 */
SceneJs.scope = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var childScope;

    return function(scope) {
        if (!childScope || !cfg.fixed || !scope.isfixed()) { // memoize scope if config and scope are constant
            childScope = SceneJs.utils.newScope(scope, cfg.fixed);
            var params = cfg.getParams(scope);
            if (params) {
                for (var key in params) {
                    childScope.put(key, params[key]);
                }
            }
        }
        SceneJs.utils.visitChildren(cfg, childScope);
    };
};


