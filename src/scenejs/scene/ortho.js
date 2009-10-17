SceneJs.ortho = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'ortho';

    var makeOrtho = function(left, right,
                             bottom, top,
                             znear, zfar) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(zfar + znear) / (zfar - znear);
        return $M([
            [2 / (right - left), 0, 0, tx],
            [0, 2 / (top - bottom), 0, ty],
            [0, 0, -2 / (zfar - znear), tz],
            [0, 0, 0, 1]
        ]);
    };

    var getIdentityMatrix = function() {
        return $M([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    };

    return SceneJs.node(
            SceneJs.apply(cfg, {

                reset : function() {
                    this.left = cfg.left || -1.0;
                    this.right = cfg.right || 1.0;
                    this.top = cfg.top || 1.0;
                    this.bottom = cfg.bottom || -1.0;
                    this.near = cfg.near || 0.1;
                    this.far = cfg.far || 100.0;
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.setProjectionMatrix(
                                makeOrtho(
                                        this.left,
                                        this.right,
                                        this.bottom,
                                        this.top,
                                        this.near,
                                        this.far));
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.setProjectionMatrix(getIdentityMatrix());
                    }
                }
            })
            );
};


