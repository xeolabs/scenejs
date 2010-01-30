SceneJs.utils.ns("SceneJs.objects");

/** Sphere geometry
 *
 */
SceneJs.objects.sphere = function() {

    var cfg = SceneJs.utils.getNodeConfig(arguments);

    if (!cfg.fixed) {

        /* Since I'm always using VBOs, we cant buffer geometry if it's going to keep changing.
         * In future versions I'll allow dynamic geometry config and just not buffer it in that case.
         */
        throw new SceneJs.exceptions.UnsupportedOperationException("Dynamic configuration of sphere objects is not supported");
    }

    var params = cfg.getParams();

    var slices = params.slices || 30;
    var rings = params.rings || 30;

    return SceneJs.geometry({
        type: "sphere_" + params.rings + "_" + params.slices,

        create: function() {

            var radius = 1;

            var vertices = [];
            var normals = [];
            var texCoords = [];
            for (var sliceNum = 0; sliceNum <= slices; sliceNum++) {
                var theta = sliceNum * Math.PI / slices;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var ringNum = 0; ringNum <= rings; ringNum++) {
                    var phi = ringNum * 2 * Math.PI / rings;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - (ringNum / rings);
                    var v = sliceNum / slices;

                    normals.push(x);
                    normals.push(y);
                    normals.push(z);
                    texCoords.push(u);
                    texCoords.push(v);
                    vertices.push(radius * x);
                    vertices.push(radius * y);
                    vertices.push(radius * z);
                }
            }

            var indices = [];
            for (var sliceNum = 0; sliceNum < slices; sliceNum++) {
                for (var ringNum = 0; ringNum < rings; ringNum++) {
                    var first = (sliceNum * (rings + 1)) + ringNum;
                    var second = first + rings + 1;
                    indices.push(first);
                    indices.push(second);
                    indices.push(first + 1);

                    indices.push(second);
                    indices.push(second + 1);
                    indices.push(first + 1);
                }
            }

            return {
                vertices : vertices,
                normals: normals,
                texCoords : texCoords,
                indices : indices,
                colors:[]
            };
        }
    });
};