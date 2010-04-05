SceneJS._utils.ns("SceneJS.objects");

/**
 * Provides a sphere geometry node by wrapping a call to the core SceneJS.geometry node.
 *
 * Example of use:
 *
 * SceneJS.objects.sphere({ rings: 30, slices: 30 })
 */
SceneJS.objects.sphere = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    /* Dynamic config OK, but only applies first time - good for assets
     */
    var params = cfg.getParams();

    var slices = params.slices || 30;
    var rings = params.rings || 30;

    /* A geometry node is normally configured with arrays of positions, normals, indices etc., but can instead be
     * configured with a "create" callback, as demonstrated here, that returns an object containing those arrays.
     *
     * Every geometry must get a type that globally identifies it within SceneJS. In this case, the
     * type is generated from the number of rings and slices.
     *
     * Since SceneJS caches geometry by type, it will attempt to reuse the geometry if it can find it in the cache,
     * otherwise it will use the callback to create it.
     */
    return SceneJS.geometry({

        /* Unique global ID for this geometry
         */
        type: "sphere_" + rings + "_" + slices,

        /* Callback to create sphere geometry
         */
        create: function() {
            var radius = 1;
            var positions = [];
            var normals = [];
            var uv = [];
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

                    normals.push(-x);
                    normals.push(-y);
                    normals.push(-z);
                    uv.push(u);
                    uv.push(v);
                    positions.push(radius * x);
                    positions.push(radius * y);
                    positions.push(radius * z);
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
                primitive : "triangles",
                positions : positions,
                normals: normals,
                uv : uv,
                indices : indices,
                colors:[]
            };
        }
    });
};