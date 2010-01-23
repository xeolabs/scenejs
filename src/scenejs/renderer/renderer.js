/** Scene graph node that sets renderer state for nodes in its subtree. These nodes may
 * be nested, and the root renderer node must specify the ID of a WebGL canvas node in
 * the DOM. Nested renderes may then omit the canvas ID to reuse the current canvas, or
 * may specify a different canvas ID to activate a different canvas.
 */
SceneJs.renderer = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend('renderer');
    var env;

    return function(scope) {
        var params = cfg.getParams(scope);
        if (!env || !params.fixed) {
            env = backend.createRendererState(params);
        }
        backend.setRendererState(env);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.restoreRendererState(env);
    };
};


