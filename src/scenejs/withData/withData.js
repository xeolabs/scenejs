/**
 * Scene node that creates a child data containing the elements of its configuration.
 */
SceneJS.withData = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var childScope;

    return SceneJS._utils.createNode(
            function(data) {
                if (!childScope || !cfg.fixed || !data.isfixed()) { // memoize data if config and data are constant
                    childScope = SceneJS._utils.newScope(data, cfg.fixed);
                    var params = cfg.getParams(data);
                    if (params) {
                        for (var key in params) {
                            childScope.put(key, params[key]);
                        }
                    }
                }
                SceneJS._utils.visitChildren(cfg, childScope);
            });
};


