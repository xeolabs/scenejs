/**
 *
 * @param cfg
 */
SceneJs.Canvas = function(cfg) {
    cfg = cfg || {};
    if (!cfg.canvasId) {
        throw 'SceneJs.Canvas config missing: canvasId';
    }

    this.preVisit = function() {
        try {
            SceneJs.Backend.acquireCanvas(cfg.canvasId);
        } catch(e) {
            throw 'Canvas node failed to acquire canvas: ' + e;
        }
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            if (cfg.clearColor) {
                backend.setClearColor(cfg.clearColor);
            }
            if (cfg.depthTest) {
                backend.setDepthTest(cfg.depthTest);
            }
            if (cfg.clearDepth) {
                backend.setClearDepth(cfg.clearDepth);
            }
        }
    };

    this.postVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.flush();
            backend.swapBuffers();
        }
        SceneJs.Backend.releaseCanvas();
    };

    SceneJs.Canvas.superclass.constructor.call(this,
            SceneJs.apply(cfg, {  getType : function() {
                return 'canvas';
            }}));
};

SceneJs.extend(SceneJs.Canvas, SceneJs.Node, {

});



