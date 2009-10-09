SceneJs.Shader = function(cfg) {
    cfg = cfg || {};

    if (!cfg.type) {
        throw 'Mandatory Shader config missing: \'type\'';
    }

    this.reset = function() {
        this.vars = cfg.vars || {};  // TODO: Clone these!!
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
          backend.activateProgram(this.getType());
            if (this.vars) {
                for (var key in this.vars) {
                    backend.setVariable(key, this.vars[key]);
                }
            }
        }
    };

    this.postVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
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