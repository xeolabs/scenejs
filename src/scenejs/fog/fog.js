/**

 */
SceneJS.fog = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('fog');
    return SceneJS._utils.createNode(
            function(scope) {
                var f = backend.getFog();
                backend.setFog(cfg.getParams(scope));
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setFog(f);
            });
};

