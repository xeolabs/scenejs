SceneJs.shader = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    var programId;
    var vars;
    var backend;

    return function(scope) {
        var params = cfg.getParams(scope);

        if (!backend) {
            if (!params.type) {
                throw 'Mandatory shader parameter missing: \'type\'';
            }
            backend = SceneJs.private.backendModules.getBackend(type);
        }

        /* Lazy-load shaders
         */
        if (!programId) {
            programId = backend.loadProgram();
        }

        /* Save previous shader and var state
         */
        var activeProgramId = backend.getActiveProgramId(); // Save active shaders
        var activeVars;
        if (activeProgramId) {
            activeVars = backend.getVars();
        }

        /* Activate new shaders and vars
         */
        backend.activateProgram(programId);
        if (params.vars) {
            backend.setVars(params.vars);
        }

        SceneJs.private.visitChildren(cfg, scope);

        /* Restore previous shader and var state
         */
        if (activeProgramId) {
            backend.activateProgram(activeProgramId);
            if (activeVars) {
                backend.setVars(activeVars);
            }
        } else {
            backend.deactivateProgram();
        }
    };
};
