/**
 * Scene node that creates a child scope containing the elements of its configuration.
 */
SceneJS.scope = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var childScope;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!childScope || !cfg.fixed || !scope.isfixed()) { // memoize scope if config and scope are constant
                    childScope = SceneJS._utils.newScope(scope, cfg.fixed);
                    var params = cfg.getParams(scope);
                    if (params) {
                        for (var key in params) {
                            childScope.put(key, params[key]);
                        }
                    }
                }
                SceneJS._utils.visitChildren(cfg, childScope);
            });
};


