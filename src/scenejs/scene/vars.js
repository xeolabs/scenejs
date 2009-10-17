SceneJs.vars = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'vars';

    return SceneJs.node(

            SceneJs.apply(cfg, {

                reset : function() {
                    this.vars = cfg.vars || {};  // TODO: Clone these!!
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        if (this.vars) {
                            backend.pushVars(this.vars);
                        }
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        if (this.vars) {
                            backend.popVars();
                        }
                    }
                }
            }));
};



