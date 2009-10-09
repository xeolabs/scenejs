SceneJs.LookAt = function(cfg) {
    cfg = cfg || {};

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };


    var init = function() {
        this.eye = cfg.eye ? cloneVec(cfg.eye) : { x: 0.0, y: 0.0, z: -10.0 };
        this.look = cfg.look ? cloneVec(cfg.look) : { x: 0.0, y: 0.0, z: 0.0 };
        this.up = cfg.up ? cloneVec(cfg.up) : { x: 0.0, y: 1.0, z: 0.0 };

    };

    init.call(this);

    // Validate params - prevents creation of a singular matrix, ie. one full of zeros

    if (this.eye.x == this.look.x && this.eye.y == this.look.y && this.eye.z == this.look.z) {
        throw 'Invald SceneJs.LookAt configuration: eye and look cannot be identical';
    }
    
    if (this.up.x == 0 && this.up.y == 0 && this.up.z == 0) {
        throw 'Invald SceneJs.LookAt configuration: up vector cannot be of zero length, ie. all elements zero';
    }

    this.reset = function() {
        init();
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

    this.preVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            var mvMatrix = makeLookAt(this.eye, this.look, this.up);
            var mvTopMatrix = backend.getModelViewMatrixTop();
            if (mvTopMatrix) {
                mvMatrix = mvTopMatrix.x(mvMatrix).ensure4x4();
            }
            backend.pushModelViewMatrix(mvMatrix);
            var gc = nodeContext.getGraphContext();
            if (!gc.modelViewTransforms) {
                gc.modelViewTransforms = [];
            }
            gc.modelViewTransforms.push({
                type: this.getType(),
                matrix: mvMatrix,
                eye: cloneVec(this.eye),
                look: cloneVec(this.look),
                up: cloneVec(this.up)
            });
        }
    };

    this.postVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.popModelViewMatrix();
            var gc = nodeContext.getGraphContext();
            gc.modelViewTransforms.pop();
        }
    };

    SceneJs.LookAt.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType: function() {
            return 'lookat';
        }
    }));
};

SceneJs.extend(SceneJs.LookAt, SceneJs.Node, {

});


