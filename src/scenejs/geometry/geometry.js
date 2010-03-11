SceneJS._utils.ns("SceneJS.geometry");

/**
 * An element of geometry
 */
SceneJS.geometry = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of geometry nodes is not supported");
    }

    var geometryBackend = SceneJS._backends.getBackend('geometry');

    return SceneJS._utils.createNode(
            function(scope) {
                var params = cfg.getParams(scope);

                if (!params.type) { // Identifies VBO's on canvas
                    throw new SceneJS.exceptions.NodeConfigExpectedException
                            ("Geometry node parameter expected : type");
                }

                /* Backend may have evicted the geometry, so we may have to re-create it
                 */
                var geoId = geometryBackend.findGeometry(params.type);

                if (!geoId) {
                    if (params.create) {
                        geoId = geometryBackend.createGeometry(params.type, params.create()); // Lazy-create geometry through callback
                    } else {
                        geoId = geometryBackend.createGeometry(params.type, {
                            vertices : params.vertices || [],
                            normals: params.normals || [],
                            colors : params.colors || [],
                            indices : params.indices || [],
                            texCoords : params.texCoords || [],
                            primitive : params.primitive
                        });
                    }
                }

                geometryBackend.drawGeometry(geoId);
                SceneJS._utils.visitChildren(cfg, scope);
            });
};

