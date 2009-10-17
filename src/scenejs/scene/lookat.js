SceneJs.lookAt = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'lookat';

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var makeLookAt = function(_eye,
                              _look,
                              _up) {
        var eye = $V([_eye.x, _eye.y, _eye.z]);
        var center = $V([_look.x, _look.y, _look.z]);
        var up = $V([_up.x, _up.y, _up.z]);
        var z = eye.subtract(center).toUnitVector();
        var x = up.cross(z).toUnitVector();
        var y = z.cross(x).toUnitVector();
        var m = $M([
            [x.e(1), x.e(2), x.e(3), 0],
            [y.e(1), y.e(2), y.e(3), 0],
            [z.e(1), z.e(2), z.e(3), 0],
            [0, 0, 0, 1]
        ]);
        var t = $M([
            [1, 0, 0, -_eye.x],
            [0, 1, 0, -_eye.y],
            [0, 0, 1, -_eye.z],
            [0, 0, 0, 1]
        ]);
        return m.x(t);
    };

    return SceneJs.node(
            SceneJs.apply(cfg, {

                reset: function() {
                    this.eye = cfg.eye ? cloneVec(cfg.eye) : { x: 0.0, y: 0.0, z: -10.0 };
                    this.look = cfg.look ? cloneVec(cfg.look) : { x: 0.0, y: 0.0, z: 0.0 };
                    this.up = cfg.up ? cloneVec(cfg.up) : { x: 0.0, y: 1.0, z: 0.0 };

                    // Prevent creation of singular matrix

                    if (this.eye.x == this.look.x && this.eye.y == this.look.y && this.eye.z == this.look.z) {
                        throw 'Invald SceneJs.lookAt configuration: eye and look cannot be identical';
                    }

                    if (this.up.x == 0 && this.up.y == 0 && this.up.z == 0) {
                        throw 'Invald SceneJs.lookAt configuration: up vector cannot be of zero length, ie. all elements zero';
                    }
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.pushModelViewMatrix(makeLookAt(this.eye, this.look, this.up));
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

