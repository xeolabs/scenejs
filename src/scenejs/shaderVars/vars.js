/** Sets vars on the current shader, temporarily overriding vars set by higher vars nodes.
 */
SceneJS.shaderVars = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('vars');

    var vars;

    return SceneJS._utils.createNode(function(scope) {
        var superVars = backend.getVars();
        if (!vars || !cfg.fixed || !superVars.fixed) { // memoize vars if config and scope are constant
            var params = cfg.getParams(scope);
            vars = {
                vars : SceneJS._utils.applyIf(params, superVars),
                fixed  : superVars.fixed
            };
        }
        backend.setVars(vars);
        SceneJS._utils.visitChildren(cfg, scope);
        backend.setVars(superVars);
    });
};




