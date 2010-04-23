/** Scene node that sets WebGL state for nodes in its subtree.
 *
 * @class SceneJS.renderer
 * @extends SceneJS.node
 */
SceneJS.renderer = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var env;

    return SceneJS._utils.createNode(
            "renderer",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {
                    if (!env || !cfg.fixed) {
                        var params = cfg.getParams(data);
                        env = SceneJS_rendererModule.createRendererState(params);
                    }
                    SceneJS_rendererModule.setRendererState(env);
                    this._renderChildren(traversalContext, data);
                    SceneJS_rendererModule.restoreRendererState(env);
                };
            })());
};