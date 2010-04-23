/** Specifies logging for its sub-nodes
 */
SceneJS.logging = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('logging');
    var funcs;

    return SceneJS._utils.createNode(
            "logging",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {
                    var prevFuncs = backend.getFuncs();
                    if (!funcs || !cfg.fixed) {
                        funcs = cfg.getParams(data);
                        var p = prevFuncs || {};
                        funcs.warn = funcs.warn || p.warn;
                        funcs.error = funcs.error || p.error;
                        funcs.debug = funcs.debug || p.debug;
                        funcs.info = funcs.info || p.info;
                    }
                    backend.setFuncs(funcs);
                    this._renderChildren(traversalContext, data);
                    backend.setFuncs(prevFuncs);
                };
            })());
};




