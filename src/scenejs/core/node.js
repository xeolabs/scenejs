SceneJs.node = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    return function(scope) {
        SceneJs.private.visitChildren(cfg, scope);
    };
};
