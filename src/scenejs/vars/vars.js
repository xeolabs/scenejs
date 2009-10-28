SceneJs.vars = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    var backend = SceneJs.private.backendModules.getBackend('vars');

    var vars;
    var superVars;

    return function(scope) {
        if (!vars || !cfg.cachable || !backend.getSafeToCache()) {
            var params = cfg.getParams(scope);
            if (params.vars) {
                superVars = backend.getVars();
                vars = SceneJs.utils.applyIf(params.vars, superVars);
            }
        }
        if (vars) { // vars are optional
            backend.setVars(vars);
            SceneJs.private.visitChildren(cfg, scope);
            backend.setVars(superVars);
        }
    };
};




