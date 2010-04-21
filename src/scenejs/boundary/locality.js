/**

 */
SceneJS.locality = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('view-locality');
    var errorBackend = SceneJS._backends.getBackend('error');
    var radii;
    return SceneJS._utils.createNode(
            function(traversalContext, data) {
                if (!radii || !cfg.fixed) {
                    if (params.innerRadius && params.outerRadius) {
                        if (params.innerRadius > params.outerRadius) {
                            errorBackend.fatalError(
                                    new SceneJS.exceptions.InvalidNodeConfigException(
                                            "SceneJS.locality innerRadius should not be greater than outerRadius"));
                        }
                    }
                    var inner = params.innerRadius || 1000;
                    var outer = params.outerRadius || inner + 500.0;
                    radii = {
                        inner: inner,
                        outer: outer
                    };
                }
                var prevRadii = backend.getRadii();
                backend.setRadii(radii);
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                backend.setRadii(prevRadii);
            });
};

