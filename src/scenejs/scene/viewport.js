SceneJs.viewport = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'viewport';

    return SceneJs.node(

            SceneJs.apply(cfg, {

                reset: function() {
                    this.x = cfg.x || 0;
                    this.y = cfg.x || 0;
                    this.width = cfg.width || 100;
                    this.height = cfg.height || 100;
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.setViewport(this.x, this.y, this.width, this.height);
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.destroyViewport();
                    }
                }
            }));
};





