/**
 * A looping node that creates a child scope from the result of its configuration function then invokes child nodes,
 * repeating this process until the config function returns nothing. This node type cannot be configured with an object.
 *
 * This node type is useful for procedurally generating subtrees within a scene. Its most common application would be
 * to dynamically instance elements of primitive geometry to build complex objects.
 */
SceneJS.generator = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(scope) {
                if (cfg.fixed) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException('generator node must be configured with a function');
                }
                var params = cfg.getParams(scope);
                while (params) {
                    var childScope = SceneJS._utils.newScope(scope);
                    for (var key in params) {
                        childScope.put(key, params[key]);
                    }
                    SceneJS._utils.visitChildren(cfg, childScope);
                    params = cfg.getParams(scope);
                }
            });
};


