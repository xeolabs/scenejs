/**
 *
 * @param cfg
 */
SceneJs.Frustum = function(cfg) {
    cfg = cfg || {};

    var init = function() {
        this.left = cfg.left || -1.0;
        this.right = cfg.right || 1.0;
        this.top = cfg.top || 1.0;
        this.bottom = cfg.bottom || -1.0;
        this.near = cfg.near || 0.1;
        this.far = cfg.far || 100.0;
    };

    init.call(this);

    this.reset = function() {
        init();
    };

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

    this.preVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            var pmMatrix = makeFrustum(
                    this.left,
                    this.right,
                    this.bottom,
                    this.top,
                    this.near,
                    this.far);
            backend.setProjectionMatrix(pmMatrix);
            var gc = nodeContext.getGraphContext();
            if (!gc.projectionTransforms) {
                gc.projectionTransforms = [];
            }
            gc.projectionTransforms.push({
                type: this.getType(),
                matrix: pmMatrix,
                frustum : {
                    left: this.left,
                    right: this.right,
                    bottom: this.bottom,
                    top: this.top,
                    near: this.near,
                    far: this.far
                }
            });
        }
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

    SceneJs.Frustum.superclass.constructor.call(this,
            SceneJs.apply(cfg, {  getType : function() {
                return 'frustum';
            }}));
};

SceneJs.extend(SceneJs.Frustum, SceneJs.Node, {

});



