/** Sets material properties on the current shader for sub-nodes
 */
SceneJS.material = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('material');

    var material;

    return SceneJS._utils.createNode(
            function(scope) {
                if (!material || !cfg.fixed) {
                    material = backend.createMaterial(cfg.getParams(scope));
                }

                var saveMaterial = backend.getMaterial();

                backend.setMaterial(material);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setMaterial(saveMaterial);
            });
};