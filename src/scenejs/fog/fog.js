/**

 */
SceneJS.fog = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('fog');
    return SceneJS._utils.createNode(
            function(scope) {
                if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                       SceneJS._utils.visitChildren(cfg, scope);
                } else {
                    var f = backend.getFog();
                    backend.setFog(cfg.getParams(scope));
                    SceneJS._utils.visitChildren(cfg, scope);
                    backend.setFog(f);
                }
            });
};

