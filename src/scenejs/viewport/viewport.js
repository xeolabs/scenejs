SceneJs.viewport = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('viewport');

    return function(scope) {
        var params = cfg.getParams(scope);

        backend.setViewport(params.x || 0, params.y || 0, params.width || 100, params.height || 100);

        SceneJs.utils.visitChildren(cfg, scope);
    };
};