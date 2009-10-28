SceneJs.selector = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    return function(scope) {
        var params = cfg.getParams(scope);
       
        SceneJs.private.visitChildren(cfg, scope);
    };
};

