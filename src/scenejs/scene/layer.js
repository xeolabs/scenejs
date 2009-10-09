/**
 * Organises geometry sub-nodes into layers and specifies which available rendering techniques are
 * applied to them.
 * @param cfg
 */
SceneJs.Layer = function(cfg) {
    cfg = cfg || {};
    this.preVisit = function() {
         var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            (cfg.cullFace) ? backend.setCullFace(true) : backend.setCullFace(false);
        }
    };
    this.postVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.setCullFace(false);
            backend.flush();
        }
    };
    SceneJs.Layer.superclass.constructor.call(this, SceneJs.apply(cfg, {
                getType: function() {
                    return 'layer';
                }
            }));
};

SceneJs.extend(SceneJs.Layer, SceneJs.Node, {});



