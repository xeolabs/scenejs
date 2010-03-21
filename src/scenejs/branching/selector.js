/**
 * Scene node that selects which of its children are active.
 */
SceneJS.selector = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(data) {
                var params = cfg.getParams(data); // Don't memoize because selection is probably dynamic
                if (!params.selection) {
                    throw 'selection node\'s mandatory selection config is missing';
                } else {
                    var max = cfg.children.length;
                    var i = params.selection.length;
                    while (--i) {
                        if (i < 0 || i >= max) {
                            throw 'selection node\'s selection index out of range';
                        }
                        cfg.children[i].call(this, data);
                    }
                }
            });
};

