/** 
 * @class A scene node that routes messages logged by nodes in its subgraph through a given set of logging functions.
 * @extends SceneJS.node
 */
SceneJS.logging = function() {
    var cfg = SceneJS.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {

        var funcs;

        $._render = function(traversalContext, data) {
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
            $._renderNodes(traversalContext, data);
            SceneJS_loggingModule.setFuncs(prevFuncs);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};

