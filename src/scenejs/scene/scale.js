SceneJs.scale = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'scale';

    return SceneJs.node(

            SceneJs.apply(cfg, {

                reset : function() {
                    this.x = cfg.x || 1.0;
                    this.y = cfg.y || 1.0;
                    this.z = cfg.z || 1.0;
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.pushModelViewMatrix(Matrix.Scale(this.x, this.y, this.z).ensure4x4());
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.popModelViewMatrix();
                    }
                }
            }));
};
