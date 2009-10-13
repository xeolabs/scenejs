SceneJs.Vars = function(cfg) {
    cfg = cfg || {};

    this.reset = function() {
        this.vars = cfg.vars || {};  // TODO: Clone these!!
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            if (this.vars) {
                backend.pushVars(this.vars);
            }
        }
    };

    this.postVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            if (this.vars) {
                backend.popVars();
            }
        }
    };

    SceneJs.ShaderVars.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType: function() {
            return 'vars';
        }
    }));
};

SceneJs.extend(SceneJs.ShaderVars, SceneJs.Node, {});


