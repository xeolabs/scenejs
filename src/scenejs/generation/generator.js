/**
 * Scene node that loops over its children, each time creating a child data scope for them from the result of its
 * configuration function, repeating this process until the config function returns nothing.
 *
 * This node type must be configured dynamically therefore, in the SceneJS style, with a configuration function.
 *
 * This node type is useful for procedurally generating scene subtrees. Its most common application would be
 * to dynamically instance elements of primitive geometry to build complex objects.
 *
 * Note that generator nodes can have a negative impact on performance, where they will often prevent subnodes from
 * employing memoization strategies that fast scene graphs often depend upon. Use them carefully when high performance
 * is desired in large scenes. The impact will depend on the type of subnode that receives the generated data.
 * For example, inability to memoize will cascade downwards through  modelling transform node hierarchies since they
 * will have to re-multiply matrices by dynamic parent modelling transforms etc.
 *
 * @class SceneJS.scalarInterpolator
 * @extends SceneJS.node
 */
SceneJS.generator = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    if (cfg.fixed) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.InvalidNodeConfigException
                        ("SceneJS.generator may only be configured with a function"));
    }

    /* Augment the basic node type
     */
    return (function($) {
        $._render = function(traversalContext, data) {
            var params = cfg.getParams(data);
            while (params) {
                var childData = SceneJS._utils.newScope(data);
                for (var key in params) {
                    childData.put(key, params[key]);
                }
                $._renderChildren(traversalContext, childData);
                params = cfg.getParams(data);
            }
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};


