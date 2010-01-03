/** Activates a OpenGL context on a specified HTML-5 canvas for sub-nodes. These can be nested; a previously-active
 * canvas will be temporarily inactive while this one's canvas is active.
 *
 */
SceneJs.canvas = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('canvas');
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

        // TODO: configure canvas from node configs?

        backend.clearCanvas(); // TODO: canvas should really be cleared globally at scene root instead of each time it's used!

        SceneJs.utils.visitChildren(cfg, scope);
        backend.flush();
        backend.setCanvas(superCanvas); // restore previous canvas

    };
};

