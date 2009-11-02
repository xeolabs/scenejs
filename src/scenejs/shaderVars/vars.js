/** Sets vars on the current shader, temporarily overriding vars set by higher vars nodes.
 */
SceneJs.shaderVars = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    var backend = SceneJs.private.backendModules.getBackend('vars');

    var vars;

    return function(scope) {
        var superVars = backend.getVars();
        if (!vars || !cfg.fixed || !superVars.fixed) { // memoize vars if config and scope are constant
            var params = cfg.getParams(scope);
            vars = {
                vars : SceneJs.utils.applyIf(params, superVars),
                fixed  : superVars.fixed
            };
        }
        backend.setVars(vars);
        SceneJs.private.visitChildren(cfg, scope);
        backend.setVars(superVars);
    };
};




