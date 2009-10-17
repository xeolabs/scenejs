SceneJs.geometry = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'geometry';

    var calculateNormals = function(vertices, faces) {
        var nvecs = new Array(vertices.length);

        for (var i = 0; i < faces.length; i++) {
            var j0 = faces[i][0];
            var j1 = faces[i][1];
            var j2 = faces[i][2];

            var v1 = $V(vertices[j0]);
            var v2 = $V(vertices[j1]);
            var v3 = $V(vertices[j2]);

            var va = v2.subtract(v1);
            var vb = v3.subtract(v1);

            var n = va.cross(vb).toUnitVector();

            if (!nvecs[j0]) nvecs[j0] = [];
            if (!nvecs[j1]) nvecs[j1] = [];
            if (!nvecs[j2]) nvecs[j2] = [];

            nvecs[j0].push(n);
            nvecs[j1].push(n);
            nvecs[j2].push(n);
        }

        var normals = new Array(vertices.length);

        // now go through and average out everything
        for (var i = 0; i < nvecs.length; i++) {
            var count = nvecs[i].length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvecs[i][j].elements[0];
                y += nvecs[i][j].elements[1];
                z += nvecs[i][j].elements[2];
            }
            normals[i] = [x / count, y / count, z / count];
        }
        return normals;
    };

    var flatten = function (ar, numPerElement) {
        var result = [];
        for (var i = 0; i < ar.length; i++) {
            if (numPerElement && ar[i].length != numPerElement)
                throw "bad element inside array";
            for (var j = 0; j < ar[i].length; j++)
                result.push(ar[i][j]);
        }
        return result;
    };

    return SceneJs.node(
            SceneJs.apply(cfg, {
                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.drawGeometry({
                            vertices : cfg.vertices && cfg.vertices.length > 0 ? flatten(cfg.vertices, 3) : [],
                            normals: cfg.normals && cfg.normals.length > 0 ? cfg.normals
                                    : flatten(calculateNormals(cfg.vertices, cfg.faces), 3),
                            colors : cfg.colors && cfg.indices.length > 0 ? flatten(cfg.colors, 3) : [],
                            indices : cfg.faces && cfg.faces.length > 0 ? flatten(cfg.faces, 3) : []
                        });
                    }
                }
            }));
};