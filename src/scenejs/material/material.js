/** Sets material properties on the current shader for sub-nodes
 *
 */
SceneJS.material = function(scenejs) {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('material');

    function colourToArray(v) {
        return v ? [ v.r || 0, v.g || 0, v.b || 0] : [ 0,  0,  0];
    }

    var material;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!material || !cfg.fixed) {
                    var params = cfg.getParams(scope);
                    material = {
                        ambient:  colourToArray(params.ambient),
                        diffuse:  colourToArray(params.diffuse),
                        specular: colourToArray(params.specular),
                        shininess:colourToArray(params.shininess)
                    };
                }

                var saveMaterial = backend.getMaterial();

                backend.setMaterial(material);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setMaterial(saveMaterial);
            });
};