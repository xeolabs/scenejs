/** Scene graph node that sets renderer state for nodes in its subtree. These nodes may
 * be nested, and the root renderer node must specify the ID of a WebGL canvas node in
 * the DOM. Nested renderes may then omit the canvas ID to reuse the current canvas, or
 * may specify a different canvas ID to activate a different canvas.
 */
SceneJS.renderer = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('renderer');
    var env;

    return SceneJS._utils.createNode(
            function(data) {
                if (!env || !cfg.fixed) {
                    var params = cfg.getParams(data);
                    env = backend.createRendererState(params);
                }
                backend.setRendererState(env);
                SceneJS._utils.visitChildren(cfg, data);
                backend.restoreRendererState(env);
            });
};


