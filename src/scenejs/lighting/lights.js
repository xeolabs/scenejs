SceneJs.lights = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('lights');

    var lights;

    return function(scope) {

        /* Memoize lights if they are given in a constant node config and if the
         * current view and model coordinate system is also constant        
         */
        if (!lights || !cfg.fixed || !backend.getSafeToCache()) {
            lights = backend.transformLights(cfg.getParams(scope).lights);
        }
        backend.pushLights(lights);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.popLights(lights.length);
    };
};