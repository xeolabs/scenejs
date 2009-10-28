SceneJs.shader = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backend.getBackend(params.type);

    return function(scope) {
        var params = cfg.getParams(scope);
        if (!params.type) {
            throw 'Mandatory shader parameter missing: \'type\'';
        }

        backend.activateProgram(params.type);
        if (params.vars) {
            backend.pushVars(params.vars);
        }
        SceneJs.private.visitChildren(cfg, scope);
        if (params.vars) {
            backend.popVars();
        }
        backend.deactivateProgram();
    };
};
