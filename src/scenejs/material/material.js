/** Sets material properties on the current shader for sub-nodes
 *
 */
SceneJS.material = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('material');

    function colourToArray(v) {
        return v ? [ v.r || 1.0, v.g || 1.0, v.b || 1.0] : [ 1.0,  1.0,  1.0];
    }

    var material;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!material || !cfg.fixed) {
                    var params = cfg.getParams(scope);
                    material = {
                        color: colourToArray(params.color),
                        specularColor: colourToArray(params.specularColor),
                        reflectivity: params.reflectivity || 0.7,
                        specular: params.specular || 1.0,
                        emissive:params.emissive || 0,
                        shininess:params.shininess || 1.0,
                        alpha:params.alpha || 1
                    };
                }

                var saveMaterial = backend.getMaterial();

                backend.setMaterial(material);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setMaterial(saveMaterial);
            });
};