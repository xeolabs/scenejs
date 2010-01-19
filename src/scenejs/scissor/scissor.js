SceneJs.scissor = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('scissor');

    return function(scope) {
        var params = cfg.getParams(scope);
        var prevScissor = backend.getScissor();
        backend.setScissor({ x: params.x, y: params.y, width: params.width, height: params.height });
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setScissor(prevScissor); // Disables scissor when null
    };
};