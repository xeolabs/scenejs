/** Activates a shader program for sub-nodes.
 */
SceneJS.shader = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of shaders is not supported");
    }

    var programId;
    var backend = SceneJS._backends.getBackend("shader");
    var params;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!params) {
                    params = cfg.getParams(scope);
                    if (!params.type) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory shader parameter missing: type");
                    }
                    if (!params.vertexShaders) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory shader parameter missing: vertexShaders");
                    }
                    if (!params.fragmentShaders) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory shader parameter missing: fragmentShaders");
                    }
                }

                /* Load shader if not yet loaded, or the containing canvas
                 * node has dynamically switched to some other canvas
                 */
                if (!programId) {
                    programId = backend.createProgram(params.type, params.vertexShaders, params.fragmentShaders);
                }

                /* Save any state set by higher shader node
                 */
                var previousProgramId = backend.getActiveProgramId();
                //        var previousVars;
                //        if (previousProgramId) {
                //            previousVars = backend.getVars();
                //        }

                /* Activate new shaders and vars
                 */
                if (previousProgramId != programId) {
                    backend.activateProgram(programId);
                }
                //        if (params.vars) {
                //            backend.setVars({
                //                vars: params.vars,
                //                fixed : cfg.fixed // Sub-vars are cacheable if these are not dynamically-generated
                //            });
                //        }

                SceneJS._utils.visitChildren(cfg, scope);

                /* Restore any state saved for higher
                 */
                if (previousProgramId) {
                    if (previousProgramId != programId) {
                        backend.activateProgram(previousProgramId);
                    }
                    //            if (previousVars) {
                    //                backend.setVars(previousVars);
                    //            }
                } else {
                    backend.deactivateProgram();
                }
            });
};


