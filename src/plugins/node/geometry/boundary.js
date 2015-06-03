/**
 * Boundary geometry node type
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/boundary",
 *      min: [-9, -3, -2],
 *      max: [2,3,12],
 *      wire: false // Default
 *  });
 *  </pre>
 */
(function () {

    SceneJS.Types.addType("geometry/boundary", {

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

        var coreId = "geometry/boundary_" + xmin + "_" + ymin + "_" + zmin + "_"
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
            positions:[
                xmax, ymax, zmax,
                xmax, ymin, zmax,
                xmin, ymin, zmax,
                xmin, ymax, zmax,
                xmax, ymax, zmin,
                xmax, ymin, zmin,
                xmin, ymin, zmin,
                xmin, ymax, zmin
            ],
            indices:[
                0, 1, 1,
                2, 2, 3,
                3, 0, 4,
                5, 5, 6,
                6, 7, 7,
                4, 0, 4,
                1, 5, 2,
                6, 3, 7
            ]
        }
    }
})();