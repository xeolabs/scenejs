SceneJs.Ortho = function(cfg) {
    cfg = cfg || {};

    var init = function() {
        this.left = cfg.left || -1.0;
        this.right = cfg.right || 1.0;
        this.top = cfg.top || 1.0;
        this.bottom = cfg.bottom || -1.0;
        this.near = cfg.near || 0.1;
        this.far = cfg.far || 100.0;
    };

    this.reset = function() {
        init();
    };

    init.call(this);

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

    this.preVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            var pmMatrix = makeOrtho(
                    this.left,
                    this.right,
                    this.bottom,
                    this.top,
                    this.near,
                    this.far);
            backend.setProjectionMatrix(pmMatrix);
        }
        var gc = nodeContext.getGraphContext();
        if (!gc.projectionTransforms) {
            gc.projectionTransforms = [];
        }
        gc.projectionTransforms.push({
            type: this.getType(),
            matrix: pmMatrix,
            volume: {
                left:  this.left,
                right: this.right,
                top :this.top,
                bottom: this.bottom ,
                near: this.near,
                far: this.far
            }
        });
    };

    var getIdentityMatrix = function() {
        return $M([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    };

    this.postVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            var pmMatrix = getIdentityMatrix();
            backend.setProjectionMatrix(pmMatrix);
            nodeContext.getGraphContext().projectionTransforms.pop();
        }
    };

    SceneJs.Ortho.superclass.constructor.call(this,
            SceneJs.apply(cfg, {  getType : function() {
                return 'ortho';
            }}));
};

SceneJs.extend(SceneJs.Ortho, SceneJs.Node, {

});



