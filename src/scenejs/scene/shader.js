SceneJs.Shader = function(cfg) {
    cfg = cfg || {};

    if (!cfg.type) {
        throw 'Mandatory Shader config missing: \'type\' (identifies required node backend)';
    }

    this.reset = function() {
        this.vars = cfg.vars || {};  // TODO: Clone these!!
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.activateProgram(this.getType());
            if (this.vars) {
                backend.pushVars(this.vars);
            }
        }
    };

    this.postVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            if (this.vars) {
                backend.popVars({});
            }
            backend.deactivateProgram();
        }
    };

    SceneJs.Shader.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType: function() {
            return cfg.type;
        }
    }));
};

SceneJs.extend(SceneJs.Shader, SceneJs.Node, {});