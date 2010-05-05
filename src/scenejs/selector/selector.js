/**
 * Scene node that selects which of its children are active.
 */
SceneJS.selector = function() {
    var errorBackend = SceneJS._error;
    var cfg = SceneJS.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {

        var selection = 0;

        $._setSelection = function(index) {

        };

        $._render = function(traversalContext, data) {
            var params = cfg.getParams(data); // Don't memoize because selection is probably dynamic
            if (!params.selection) {
                errorBackend.fatalError(new SceneJS.NodeConfigExpectedException
                        ("SceneJS.selection node mandatory property missing: selection"));
            } else {
                var max = cfg.children.length;
                var i = params.selection.length;
                while (--i) {
                    if (i < 0 || i >= max) {
                        errorBackend.fatalError(new SceneJS.InvalidNodeConfigException
                                ("SceneJS.selection selection property out of range"));
                    }
                    $._renderNodes(i, traversalContext, data);
                }
            }
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
