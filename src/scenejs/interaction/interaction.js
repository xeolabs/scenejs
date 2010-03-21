SceneJS.interaction = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('naming');
    var name;
    return SceneJS._utils.createNode(
            function(data) {
                var params = cfg.getParams(data);
                backend.pushName(name);
                SceneJS._utils.visitChildren(cfg, data);
                backend.popName();
            });
};




