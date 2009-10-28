SceneJs.lights = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backendModules.getBackend('lights');

    var lights;

    return function(scope) {
        if (!lights || !cfg.cachable || !backend.getSafeToCache()) {
            lights = backend.transformLights(cfg.getParams(scope).lights);
        }
        backend.pushLights(lights);
        SceneJs.private.visitChildren(cfg, scope);
        backend.popLights();
    };
};