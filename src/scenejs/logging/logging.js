/** Scene node that routes messages logged by nodes in its subgraph through a given set of logging functions.
 *
 * @class SceneJS.logging
 * @extends SceneJS.node
 */
SceneJS.logging = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var funcs;

    return SceneJS._utils.createNode(
            "logging",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {
                    var prevFuncs = SceneJS_loggingModule.getFuncs();
                    if (!funcs || !cfg.fixed) {
                        funcs = cfg.getParams(data);
                        var p = prevFuncs || {};
                        funcs.warn = funcs.warn || p.warn;
                        funcs.error = funcs.error || p.error;
                        funcs.debug = funcs.debug || p.debug;
                        funcs.info = funcs.info || p.info;
                    }
                    SceneJS_loggingModule.setFuncs(funcs);
                    this._renderChildren(traversalContext, data);
                    SceneJS_loggingModule.setFuncs(prevFuncs);
                };
            })());
};




