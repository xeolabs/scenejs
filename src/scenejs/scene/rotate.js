SceneJs.rotate = function() {
    var cfg = SceneJs.getConfig(arguments);

    var degToRad = function(degrees) {
        return degrees * Math.PI / 180.0;
    };

    var type = 'rotate';

    return SceneJs.node(

            SceneJs.apply(cfg, {

                reset : function() {
                    this.angle = cfg.angle || 0.0;
                    this.x = cfg.x || 0.0;
                    this.y = cfg.y || 0.0;
                    this.z = cfg.z || 0.0;
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.pushModelViewMatrix(
                                Matrix.Rotation(degToRad(this.angle),
                                        Vector.create([this.x, this.y, this.z])).ensure4x4());
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
