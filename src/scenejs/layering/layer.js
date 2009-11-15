SceneJs.layer = function() {
    var cfg = SceneJs.getConfig(arguments);

    var type = 'layer';

    return SceneJs.node(
            SceneJs.apply(cfg, {
                preVisit : function() {
                    var backend = SceneJs.backends.getBackend(type);
                    if (backend) {
                        (cfg.cullFace) ? backend.setCullFace(true) : backend.setCullFace(false);
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.backends.getBackend(type);
                    if (backend) {
                        backend.setCullFace(false);
                        backend.flush();
                    }
                }}));
};
