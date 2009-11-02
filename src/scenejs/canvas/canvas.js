/** Activates a OpenGL context on a specified HTML-5 canvas for sub-nodes. These can be nested; a previously-active
 * canvas will be temporarily inactive while this one's canvas is active.
 *
 */
SceneJs.canvas = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backendModules.getBackend('canvas');
    var canvas; // memoized

    return function(scope) {
        var params = cfg.getParams(scope);
        if (!params.canvasId) {
            throw 'canvas node parameter missing: canvasId';
        }

        var superCanvas = backend.getCanvas(); // remember previous canvas if any

        if (!canvas || !cfg.fixed) {
            canvas = backend.findCanvas(params.canvasId);
        }
        backend.setCanvas(canvas);

        if (params.clearColor) {
            backend.setClearColor(params.clearColor);
        }
        if (params.depthTest) {
            backend.setDepthTest(params.depthTest);
        }
        if (params.clearDepth) {
            backend.setClearDepth(params.clearDepth);
        }

        SceneJs.private.visitChildren(cfg, scope);

        backend.flush();
        backend.swapBuffers();
        if (superCanvas) {
            backend.setCanvas(superCanvas); // restore previous canvas
        }
    };
};