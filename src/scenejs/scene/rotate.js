SceneJs.Rotate = function(cfg) {
    cfg = cfg || {};

    var init = function() {
        this.angle = cfg.angle || 0.0;
        this.x = cfg.x || 0.0;
        this.y = cfg.y || 0.0;
        this.z = cfg.z || 0.0;
    };

    init.call(this);

    this.reset = function() {
        init.call(this);
    };

    var degToRad = function(degrees) {
        return degrees * Math.PI / 180.0;
    };

    this.preVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            var mvMatrix = Matrix.Rotation(degToRad(this.angle), Vector.create([this.x, this.y, this.z])).ensure4x4();
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
                type:this.getType(),
                angle : this.angle,
                matrix: mvMatrix,
                x : this.x,
                y : this.y,
                z : this.z
            });
        }
    };

    this.postVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.popModelViewMatrix();
            nodeContext.getGraphContext().modelViewTransforms.pop();
        }
    };

    SceneJs.Rotate.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType : function() {
            return 'rotate';
        }
    }));
}
        ;

SceneJs.extend(SceneJs.Rotate, SceneJs.Node, {});
