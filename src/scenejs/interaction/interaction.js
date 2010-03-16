SceneJS.interaction = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('naming');
    var name;
    return SceneJS._utils.createNode(
            function(scope) {
                var params = cfg.getParams(scope);
                backend.pushName(name);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.popName();
            });
};




