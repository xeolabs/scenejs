SceneJs.viewport = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);
    var backend = SceneJs.private.backend.getBackend('viewport');
    return function(scope) {
        var params = cfg.getParams(scope);
        backend.setViewport(params.x || 0, params.y || 0, params.width || 100, params.height || 100);
        SceneJs.private.visitChildren(cfg, scope);
    };
};