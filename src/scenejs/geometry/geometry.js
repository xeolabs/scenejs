SceneJS._utils.ns("SceneJS.geometry");

/**
 * An element of geometry
 */
SceneJS.geometry = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var geometryBackend = SceneJS._backends.getBackend('geometry');

    var params;
    var type;
    var create;
    var geo = {};

    return SceneJS._utils.createNode(
            function(data) {

                /* Dynamic config only happens first time
                 */
                if (!params) {
                    params = cfg.getParams(data);
                    if (!params.type) { // Identifies VBO's on canvas
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Geometry node parameter expected : type");
                    }
                    type = SceneJS._utils.getParam(params.type, data);
                    if (params.create instanceof Function) {

                        /* Create must not be a dynamic config function!                        
                         */
                        create = params.create;
                    } else {
                        geo = {
                            vertices : SceneJS._utils.getParam(params.vertices, data) || [],
                            normals : SceneJS._utils.getParam(params.normals, data) || [],
                            colors : SceneJS._utils.getParam(params.colors, data) || [],
                            indices : SceneJS._utils.getParam(params.indices, data) || [],
                            texCoords : SceneJS._utils.getParam(params.texCoords, data) || [],
                            primitive : SceneJS._utils.getParam(params.primitive, data) || "triangles"
                        };
                    }
                }

                /* Backend may have evicted the geometry, so we may have to re-create it
                 */
                var geoId = geometryBackend.findGeometry(type);

                if (!geoId) {
                    if (create) {
                        geoId = geometryBackend.createGeometry(type, create()); // Lazy-create geometry through callback
                    } else {
                        geoId = geometryBackend.createGeometry(type, geo);
                    }
                }

                geometryBackend.drawGeometry(geoId);
                SceneJS._utils.visitChildren(cfg, data);
            });
};

