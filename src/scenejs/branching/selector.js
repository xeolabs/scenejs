/**
 * Scene node that selects which of its children are active.
 */
SceneJS.selector = function() {
    var errorBackend = SceneJS._backends.getBackend("error");
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(data) {
                var params = cfg.getParams(data); // Don't memoize because selection is probably dynamic
                if (!params.selection) {
                    errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                            ("SceneJS.selection node mandatory property missing: selection"));
                } else {
                    var max = cfg.children.length;
                    var i = params.selection.length;
                    while (--i) {
                        if (i < 0 || i >= max) {
                            errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException
                                    ("SceneJS.selection selection property out of range"));
                        }
                        cfg.children[i].call(this, data);
                    }
                }
            });
};

