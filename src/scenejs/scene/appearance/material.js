SceneJs.material = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backend.getBackend('material');

    var cloneColor = function(v) {
        v = v || {};
        return { r: v.r || 0, g: v.g || 0, b: v.b || 0, a:v.a || 1 };
    };

    var material;

    return function(scope) {

        if (!material || !cfg.cachable) {
            var params = cfg.getParams(scope);
            material = {
                ambient:  cloneColor(params.ambient),
                diffuse:  cloneColor(params.diffuse),
                specular: cloneColor(params.specular),
                shininess:cloneColor(params.shininess)
            };
        }

        var currentMaterial = backend.getMaterial();

        backend.setMaterial(material);
        SceneJs.private.visitChildren(cfg, scope);
        backend.setMaterial(currentMaterial);
    };
};