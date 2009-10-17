SceneJs.translate = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'translate';

    return SceneJs.node(

            SceneJs.apply(cfg, {

                reset : function() {
                    this.x = cfg.x || 0.0;
                    this.y = cfg.y || 0.0;
                    this.z = cfg.z || 0.0;
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.pushModelViewMatrix(Matrix.Translate(this.x, this.y, this.z).ensure4x4());
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
