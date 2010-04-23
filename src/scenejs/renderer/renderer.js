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
            "renderer",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {
                    if (!env || !cfg.fixed) {
                        var params = cfg.getParams(data);
                        env = backend.createRendererState(params);
                    }
                    backend.setRendererState(env);
                    this._renderChildren(traversalContext, data);
                    backend.restoreRendererState(env);
                };
            })());
};