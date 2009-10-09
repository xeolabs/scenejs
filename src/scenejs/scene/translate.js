SceneJs.Translate = function(cfg) {
    cfg = cfg || {};

    var init = function() {
        this.x = cfg.x || 0.0;
        this.y = cfg.y || 0.0;
        this.z = cfg.z || 0.0;
    };

    init.call(this);

    this.reset = function() {
        init.call(this);
    };

    this.preVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            var mvMatrix = Matrix.Translate(this.x, this.y, this.z).ensure4x4();
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

    SceneJs.Translate.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType : function() {
            return 'translate';
        }
    }));
};

SceneJs.extend(SceneJs.Translate, SceneJs.Node, {});
