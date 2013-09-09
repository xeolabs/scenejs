/**
 * Quad geometry node type
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "prims/quad",
 *      wire: false // Default
 *  });
 */
(function () {

    SceneJS.Types.addType("prims/quad", {
        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        var coreId = "prims/quad" + (params.wire ? "wire" : "_solid");

        // If a node core already exists for a prim with the given properties,
        // then for efficiency we'll share that core rather than create another geometry
        if (this.getScene().hasCore("geometry", coreId)) {
            return {
                type: "geometry",
                coreId:coreId
            };
        }

        // Otherwise, create a new geometry
        return {
            type: "geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId:coreId,
            positions:[ 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0 ],
            normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
            uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
            indices:[ 0, 1, 2, 0, 2, 3 ]
        };
    }
})();