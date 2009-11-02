/** Sets material properties on the current shader for sub-nodes
 *
 */
SceneJs.material = function() {
    var cfg = SceneJs.private.getNodeConfig(arguments);

    var backend = SceneJs.private.backendModules.getBackend('material');

    var cloneColor = function(v) {
        return v ? { r: v.r || 0, g: v.g || 0, b: v.b || 0, a:v.a || 1 } : { r: 0, g : 0, b: 0};
    };

    var material;   // memoized

    return function(scope) {
        if (!material || !cfg.fixed) { // if not memoized or params are variable
            var params = cfg.getParams(scope);
            material = {
                ambient:  cloneColor(params.ambient),
                diffuse:  cloneColor(params.diffuse),
                specular: cloneColor(params.specular),
                shininess:cloneColor(params.shininess)
            };
        }

        var saveMaterial = backend.getMaterial();

        backend.setMaterial(material);
        SceneJs.private.visitChildren(cfg, scope);
        backend.setMaterial(saveMaterial);
    };
};