SceneJs.lights = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backendModules.getBackend('lights');

    var lights;

    return function(scope) {

        /* Memoize lights if they are given in a constant node config and if the
         * current view and model coordinate system is also constant        
         */
        if (!lights || !cfg.fixed || !backend.getSafeToCache()) {
            lights = backend.transformLights(cfg.getParams(scope).lights);
        }
        backend.pushLights(lights);
        SceneJs.private.visitChildren(cfg, scope);
        backend.popLights();
    };
};