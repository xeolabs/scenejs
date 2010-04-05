SceneJS._utils.ns("SceneJS.geometry");

/**
 * An element of geometry
 */
(function() {

    var calculateNormals = function(positions, indices) {
        var nvecs = new Array(positions.length);

        for (var i = 0; i < indices.length; i++) {
            var j0 = indices[i+0];
            var j1 = indices[i+1];
            var j2 = indices[i+2];

            var v1 = positions[j0];
            var v2 = positions[j1];
            var v3 = positions[j2];

            var va = SceneJS._math.subVec4(v2, v1);
            var vb = SceneJS._math.subVec4(v3, v1);

            var n = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(va, vb));

            if (!nvecs[j0]) nvecs[j0] = [];
            if (!nvecs[j1]) nvecs[j1] = [];
            if (!nvecs[j2]) nvecs[j2] = [];

            nvecs[j0].push(n);
            nvecs[j1].push(n);
            nvecs[j2].push(n);
        }

        var normals = new Array(positions.length);

        // now go through and average out everything
        for (var i = 0; i < nvecs.length; i++) {
            var count = nvecs[i].length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvecs[i][j][0];
                y += nvecs[i][j][1];
                z += nvecs[i][j][2];
            }
            normals[i] = [x / count, y / count, z / count];
        }
        return normals;
    };

    SceneJS.geometry = function() {

        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var geometryBackend = SceneJS._backends.getBackend('geometry');

        var params;
        var type;
        var create;
        var geo = {};

        return SceneJS._utils.createNode(
                function(traversalContext, data) {

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
                                positions : SceneJS._utils.getParam(params.positions, data) || [],
                                normals : SceneJS._utils.getParam(params.normals, data) || [],
                                colors : SceneJS._utils.getParam(params.colors, data) || [],
                                indices : SceneJS._utils.getParam(params.indices, data) || [],
                                uv : SceneJS._utils.getParam(params.uv, data) || [],
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
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                });
    };

})();