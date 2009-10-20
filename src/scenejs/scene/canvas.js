/**
 *  Activates a DOM canvas element for its subtree. You can have more than one canvas node in your scene if you want
 * multiple views of the scene on multiple canvas tags throughout your page.
 */
SceneJs.canvas = function() {
    var cfg = SceneJs.getConfig(arguments);

    if (!cfg.canvasId) {
        throw 'SceneJs.canvas config missing: canvasId';
    }

    var type = 'canvas';

    return SceneJs.node(
            SceneJs.apply(cfg, {

                preVisit : function() {
                    try {
                        SceneJs.Backend.acquireCanvas(cfg.canvasId);
                    } catch(e) {
                        throw 'Canvas node failed to acquire canvas element: ' + e;
                    }
                    var backend = SceneJs.Backend.getNodeBackend(type);
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
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.flush();
                        backend.swapBuffers();
                    }
                    SceneJs.Backend.releaseCanvas();
                }
            }));
};





