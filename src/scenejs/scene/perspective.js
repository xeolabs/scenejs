/**
 *
 * @param cfg
 */
SceneJs.Perspective = function(cfg) {
    cfg = cfg || {};

    var init = function() {
        this.fovy = cfg.fovy || 60.0;
        this.aspect = cfg.aspect || 1.0;
        this.near = cfg.near || 0.1;
        this.far = cfg.far || 400.0;
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
            var frustumH = Math.tan(this.fovy / 360.0 * Math.PI) * this.near;
            var frustumW = frustumH * aspect;
            var frustum = {
                left: -frustumW,
                right: frustumW,
                bottom: -frustumH,
                top: frustumH,
                near: this.near,
                far: this.far
            };
            var pmMatrix = makeFrustum(
                    frustum.left,
                    frustum.right,
                    frustum.bottom,
                    frustum.top,
                    frustum.near,
                    frustum.far);
            backend.setProjectionMatrix(pmMatrix);
            var gc = nodeContext.getGraphContext();
            if (!gc.projectionTransforms) {
                gc.projectionTransforms = [];
            }
            gc.projectionTransforms.push({
                type: this.getType(),
                matrix: pmMatrix,
                frustum : frustum,
                fovy : this.fovy,
                aspect : this.aspect
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
            var gc = nodeContext.getGraphContext();
            gc.projectionTransforms.pop();
        }
    };


    SceneJs.Perspective.superclass.constructor.call(this,
            SceneJs.apply(cfg, {  getType : function() {
                return 'perspective';
            }}));
};

SceneJs.extend(SceneJs.Perspective, SceneJs.Node, {});