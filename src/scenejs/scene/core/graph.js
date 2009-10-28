SceneJs.graph = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    return {
        render : function(paramOverrides) {
            var scope = SceneJs.private.newScope();
            var params = cfg.getParams();
            for (var key in params) {    // Push scene params into scope
                scope.put(key, params[key]);
            }
            if (paramOverrides) {        // Override with traversal params
                for (var key in paramOverrides) {
                    scope.put(key, paramOverrides[key]);
                }
            }
            SceneJs.private.visitChildren(cfg, scope);
        }
    };
};
