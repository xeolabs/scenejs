/**
 * Scene node that selects which of its children are active.
 */
SceneJs.selector = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    return function(scope) {
        var params = cfg.getParams(scope); // Don't memoize because selection is probably dynamic
        if (!params.selection) {
            throw 'selection node\'s mandatory selection config is missing';
        } else {
            var max = cfg.children.length;
            var i = params.selection.length;
            while (--i) {
                if (i < 0 || i >= max) {
                    throw 'selection node\'s selection index out of range';
                }
                cfg.children[i].call(this, scope);
            }
        }
    };
};

