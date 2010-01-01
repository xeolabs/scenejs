/**
 * A looping node that creates a child scope from the result of its configuration function then invokes child nodes,
 * repeating this process until the config function returns nothing. This node type cannot be configured with an object.
 *
 * This node type is useful for procedurally generating subtrees within a scene. Its most common application would be
 * to dynamically instance elements of primitive geometry to build complex objects.
 */
SceneJs.generator = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    return function(scope) {
        if (cfg.fixed) {
            throw new SceneJs.exceptions.InvalidNodeConfigException('generator node must be configured with a function');
        }
        var params = cfg.getParams(scope);
        while (params) {
            var childScope = SceneJs.utils.newScope(scope);
            for (var key in params) {
                childScope.put(key, params[key]);
            }
            SceneJs.utils.visitChildren(cfg, childScope);
            params = cfg.getParams(scope);
        }
    };
};


