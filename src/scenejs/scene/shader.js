SceneJs.shader = function() {

    var cfg = SceneJs.getConfig(arguments);

    if (!cfg.type) {
        throw 'Mandatory Shader config missing: \'type\' (identifies required node backend)';
    }

    return SceneJs.node(

            SceneJs.apply(cfg, {

                reset : function() {
                    this.vars = cfg.vars || {};  // TODO: Clone these!!
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(cfg.type);
                    if (backend) {
                        backend.activateProgram(cfg.type);
                        if (this.vars) {
                            backend.pushVars(this.vars);
                        }
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(cfg.type);
                    if (backend) {
                        if (this.vars) {
                            backend.popVars();
                        }
                        backend.deactivateProgram();
                    }
                }}));
};
