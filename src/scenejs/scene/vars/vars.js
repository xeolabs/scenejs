SceneJs.vars = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    var backend = SceneJs.private.backend.getBackend('vars');

    return function(scope) {
        var params = cfg.getParams(scope);
        backend.pushVars(params.vars || []);
        SceneJs.private.visitChildren(cfg, scope);
        backend.popVars();
    };
};




