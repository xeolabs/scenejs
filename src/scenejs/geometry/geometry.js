/**
 * An element of geometry
 */
SceneJS.geometry = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of geometry nodes is not supported");
    }

    var backend = SceneJS._backends.getBackend('geometry');

    return SceneJS._utils.createNode(
            function(scope) {
                var params = cfg.getParams(scope);

                if (!params.type) { // Identifies VBO's on canvas
                    throw new SceneJS.exceptions.NodeConfigExpectedException("Geometry node parameter expected : type");
                }

                if (!params.primitive) { // "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
                    throw new SceneJS.exceptions.NodeConfigExpectedException("Geometry node parameter expected : primitive");
                }

                /* Backend may have evicted the geometry, so we may have to re-create it
                 */
                var geoId = backend.findGeometry(params.type);

                if (!geoId) {
                    if (params.create) {
                        geoId = backend.createGeometry(params.type, params.create()); // Lazy-create geometry through callback
                    } else {
                        geoId = backend.createGeometry(params.type, {
                            vertices : params.vertices || [],
                            normals: params.normals || [],
                            colors : params.colors || [],
                            indices : params.indices || [],
                            texCoords : params.texCoords || [],
                            primitive : params.primitive
                        });
                    }
                }

                backend.drawGeometry(geoId);
                SceneJS._utils.visitChildren(cfg, scope);
            });
};

