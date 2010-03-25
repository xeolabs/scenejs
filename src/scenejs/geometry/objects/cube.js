SceneJS._utils.ns("SceneJS.objects");

/**
 * Provides a cube geometry node by wrapping a call to the core SceneJS.geometry node.
 *
 * Cube geometry. This node type takes no parameters, and the cube is fixed to size [-1..1] on each axis,
 * so if you want to resize it you should wrap it in a scale node.
 */

SceneJS.objects.cube = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    /* Dynamic config OK, but only applies first time - good for assets    
     */
    var params = cfg.getParams();

    var x = params.xSize || 1;
    var y = params.ySize || 1;
    var z = params.zSize || 1;

    /* A geometry node is normally configured with arrays of vertices, normals, indices etc., but can instead be
     * configured with a "create" callback, as demonstrated here, that returns an object containing those arrays.
     *
     * Every geometry must get a type that globally identifies it within SceneJS. In this case, the
     * type is generated from the number of rings and slices.
     *
     * Since SceneJS caches geometry by type, it will attempt to reuse the geometry if it can find it in the cache,
     * otherwise it will use the callback to create it.
     */
    return SceneJS.geometry({

        type: "cube_" + x + "_" + y + "_" + z,

        /* Callback to create sphere geometry
         */
        create: function() {
            var vertices = [
                x, y, z,
                -x, y, z,
                -x,-y, z,
                x,-y, z,
                // v0-v1-v2-v3 front
                x, y, z,
                x,-y, z,
                x,-y,-z,
                x, y,-z,
                // v0-v3-v4-v5 right
                x, y, z,
                x, y,-z,
                -x, y,-z,
                -x, y, z,
                // v0-v5-v6-v1 top
                -x, y, z,
                -x, y,-z,
                -x,-y,-z,
                -x,-y, z,
                // v1-v6-v7-v2 left
                -x,-y,-z,
                x,-y,-z,
                x,-y, z,
                -x,-y, z,
                // v7-v4-v3-v2 bottom
                x,-y,-z,
                -x,-y,-z,
                -x, y,-z,
                x, y,-z
            ];   // v4-v7-v6-v5 back

            var normals = [
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                // v0-v1-v2-v3 front
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                // v0-v3-v4-v5 right
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                // v0-v5-v6-v1 top
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                // v1-v6-v7-v2 left
                0,1, 0,
                0,1, 0,
                0,1, 0,
                0,1, 0,
                // v7-v4-v3-v2 bottom
                0, 0,1,
                0, 0,1,
                0, 0,1,
                0, 0,1
            ];    // v4-v7-v6-v5 back

            var texCoords = [
                x, y,
                0, y,
                0, 0,
                x, 0,
                // v0-v1-v2-v3 front
                0, y,
                0, 0,
                x, 0,
                x, y,
                // v0-v3-v4-v5 right
                x, 0,
                x, y,
                0, y,
                0, 0,
                // v0-v5-v6-v1 top
                x, y,
                0, y,
                0, 0,
                x, 0,
                // v1-v6-v7-v2 left
                0, 0,
                x, 0,
                x, y,
                0, y,
                // v7-v4-v3-v2 bottom
                0, 0,
                x, 0,
                x, y,
                0, y
            ];   // v4-v7-v6-v5 back

            var indices = [
                0, 1, 2,
                0, 2, 3,
                // front
                4, 5, 6,
                4, 6, 7,
                // right
                8, 9,10,
                8,10,11,
                // top
                12,13,14,
                12,14,15,
                // left
                16,17,18,
                16,18,19,
                // bottom
                20,21,22,
                20,22,23
            ] ;  // back

            return {
                primitive : "triangles",
                vertices : vertices,
                normals: normals,
                texCoords : texCoords,
                indices : indices,
                colors:[]
            };
        }
    });
};



