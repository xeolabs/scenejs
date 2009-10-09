/** Variables for an enclosing Program node
 *
 * @param cfg
 */
SceneJs.ShaderVars = function(cfg) {
    cfg = cfg || {};

    this.reset = function() {
        this.vars = cfg.vars || {};  // TODO: Clone these!!
    };

    this.preVisit = function() {
         var backend = SceneJs.Backend.getNodeBackend(this.getType());
         if (backend) {
            if (this.vars) {
                for (var key in this.vars) {
                    backend.setVariable(key, this.vars[key]);
                }
            }
         }
     };

    SceneJs.ShaderVars.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType: function() {
            return 'shader-vars';
        }
    }));
};

SceneJs.extend(SceneJs.ShaderVars, SceneJs.Node, {});


