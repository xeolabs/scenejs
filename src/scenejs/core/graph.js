/** Root node of a scene graph. Like all nodes, its arguments are a config object followed by
 * zero or more child nodes. The members of the config object are set on the root data scope when rendered.
 *
 */
SceneJs.graph = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    return {

        /**
         * Renders the scene graph, passing in the given parameters to override node parameters
         * set on the root data scope
         */
        render : function(paramOverrides) {
            var scope = SceneJs.utils.newScope(null, false); // TODO: how to determine fixed scope for cacheing??
            var params = cfg.getParams();
            for (var key in params) {    // Push scene params into scope
                scope.put(key, params[key]);
            }
            if (paramOverrides) {        // Override with traversal params
                for (var key in paramOverrides) {
                    scope.put(key, paramOverrides[key]);
                }
            }
            SceneJs.utils.visitChildren(cfg, scope);
        }
    };
};
