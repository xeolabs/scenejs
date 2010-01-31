/** Activates a shader program for sub-nodes.
 *
 */
SceneJs.shader = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var canvasId;
    var programId;
    var backend;

    return function(scope) {
        var params = cfg.getParams(scope);

        if (!backend) {
            if (!params.type) {
                throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory shader parameter missing: \'type\'");
            }
            backend = SceneJs.backends.getBackend(params.type);
        }

        /* Load shader if not yet loaded, or the containing canvas
         * node has dynamically switched to some other canvas
         */
        if (!programId || (canvasId != backend.getActiveCanvasId())) {
            canvasId = backend.getActiveCanvasId();
            programId = backend.loadProgram();
        }

        /* Save any state set by higher shader node
         */
        var previousProgramId = backend.getActiveProgramId(); // Save active shaders
        var previousVars;
        if (previousProgramId) {
            previousVars = backend.getVars();
        }

        /* Activate new shaders and vars
         */
        if (previousProgramId != programId) {
            backend.activateProgram(programId);
        }
        if (params.vars) {
            backend.setVars({
                vars: params.vars,
                fixed : cfg.fixed // Sub-vars are cacheable if these are not dynamically-generated
            });
        }

        SceneJs.utils.visitChildren(cfg, scope);

        /* Restore any state saved for higher
         */
        if (previousProgramId) {
            if (previousProgramId != programId) {
                backend.activateProgram(previousProgramId);
            }
            if (previousVars) {
                backend.setVars(previousVars);
            }
        } else {
            backend.deactivateProgram();
        }
    };
};


