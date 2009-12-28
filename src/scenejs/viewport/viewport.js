SceneJs.viewport = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('viewport');

    return function(scope) {
        var params = cfg.getParams(scope);

        var prevViewport = backend.getViewport();
        backend.setViewport({ x: params.x || 0, y: params.y || 0, width: params.width || 100, height: params.height || 100});
        SceneJs.utils.visitChildren(cfg, scope);
        if (prevViewport) {
            backend.setViewport(prevViewport);
        }
    };
};