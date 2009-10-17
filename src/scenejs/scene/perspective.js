SceneJs.perspective = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'perspective';

    var makeFrustum = function(left, right,
                               bottom, top,
                               znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);
        return $M([
            [X, 0, A, 0],
            [0, Y, B, 0],
            [0, 0, C, D],
            [0, 0, -1, 0]
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
                    this.fovy = cfg.fovy || 60.0;
                    this.aspect = cfg.aspect || 1.0;
                    this.near = cfg.near || 0.1;
                    this.far = cfg.far || 400.0;
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        var frustumH = Math.tan(this.fovy / 360.0 * Math.PI) * this.near;
                        var frustumW = frustumH * this.aspect;
                        backend.setProjectionMatrix(makeFrustum(
                                -frustumW,
                                frustumW,
                                -frustumH,
                                frustumH,
                                this.near,
                                this.far
                                ));
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.setProjectionMatrix(getIdentityMatrix());
                    }
                }
            }));
};