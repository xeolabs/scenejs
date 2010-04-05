/** Sets material properties on the current shader for sub-nodes
 */
SceneJS.material = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('material');

    var material;

    return SceneJS._utils.createNode(
            function(traversalContext, data) {
                if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                } else {
                    if (!material || !cfg.fixed) {
                        material = backend.createMaterial(cfg.getParams(data));
                    }
                    var saveMaterial = backend.getMaterial();
                    backend.setMaterial(material);
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                    backend.setMaterial(saveMaterial);
                }
            });

};