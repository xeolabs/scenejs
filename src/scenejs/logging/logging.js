/** Specifies logging for its sub-nodes
 */
SceneJS.logging = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('logging');
    var funcs;
    return SceneJS._utils.createNode(
            function(scope) {
                var prevFuncs = backend.getFuncs();
                if (!funcs || !cfg.fixed) {
                    funcs = cfg.getParams(scope);
                    var p = prevFuncs || {};
                    funcs.warn = funcs.warn || p.warn;
                    funcs.error = funcs.error || p.error;
                    funcs.debug = funcs.debug || p.debug;
                    funcs.info = funcs.info || p.info;
                }
                backend.setFuncs(funcs);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setFuncs(prevFuncs);
            });
};




