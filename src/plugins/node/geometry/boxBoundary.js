/**
 * Box geometry node type
 * init in a boundary style
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/box",
 *      min: [-9, -3, -2],
 *      max: [2,3,12],
 *      wire: false // Default
 *  });
 *  </pre>
 */
(function () {

    SceneJS.Types.addType("geometry/boxBoundary", {

        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        var min = params.min || [0, 0, 0];
        var max = params.max || [0, 0, 0];

        var xmin = min[0];
        var ymin = min[1];
        var zmin = min[2];
        var xmax = max[0];
        var ymax = max[1];
        var zmax = max[2];

        var x = xmax - xmin;
        var y = ymax - ymin;

        var coreId = "geometry/boxBoundary_" + xmin + "_" + ymin + "_" + zmin + "_"
            + xmax + "_" + ymax + "_" + zmax + (params.wire ? "wire" : "_solid");

        // If a node core already exists for a prim with the given properties,
        // then for efficiency we'll share that core rather than create another geometry
        if (this.getScene().hasCore("geometry", coreId)) {
            return {
                type:"geometry",
                coreId:coreId
            };
        }

        // Otherwise, create a new geometry
        return {
            type:"geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId:coreId,
            positions:new Float32Array([
                xmax, ymax, zmax, xmin, ymax, zmax, xmin, ymin, zmax, xmax, ymin, zmax, // v0-v1-v2-v3 front
                xmax, ymax, zmax, xmax, ymin, zmax, xmax, ymin, zmin, xmax, ymax, zmin, // v0-v3-v4-v5 right
                xmax, ymax, zmax, xmax, ymax, zmin, xmin, ymax, zmin, xmin, ymax, zmax, // v0-v5-v6-v1 top
                xmin, ymax, zmax, xmin, ymax, zmin, xmin, ymin, zmin, xmin, ymin, zmax, // v1-v6-v7-v2 left
                xmin, ymin, zmin, xmax, ymin, zmin, xmax, ymin, zmax, xmin, ymin, zmax, // v7-v4-v3-v2 bottom
                xmax, ymin, zmin, xmin, ymin, zmin, xmin, ymax, zmin, xmax, ymax, zmin // v4-v7-v6-v5 back
            ]),
            normals:new Float32Array([
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // v0-v1-v2-v3 front
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // v0-v5-v6-v1 top
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // v1-v6-v7-v2 left
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // v7-v4-v3-v2 bottom
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1     // v4-v7-v6-v5 back
            ]),
            uv:new Float32Array([
                x, y, 0, y, 0, 0, x, 0, // v0-v1-v2-v3 front
                0, y, 0, 0, x, 0, x, y, // v0-v3-v4-v5 right
                x, 0, x, y, 0, y, 0, 0, // v0-v5-v6-v1 top
                x, y, 0, y, 0, 0, x, 0, // v1-v6-v7-v2 left
                0, 0, x, 0, x, y, 0, y, // v7-v4-v3-v2 bottom
                0, 0, x, 0, x, y, 0, y    // v4-v7-v6-v5 back
            ]),
            indices:[
                0, 1, 2, 0, 2, 3, // front
                4, 5, 6, 4, 6, 7, // right
                8, 9, 10, 8, 10, 11, // top
                12, 13, 14, 12, 14, 15, // left
                16, 17, 18, 16, 18, 19, // bottom
                20, 21, 22, 20, 22, 23   // back
            ]
        };
    }
})();