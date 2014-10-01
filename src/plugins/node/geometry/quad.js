/**
 * Quad geometry node type
 *
 *  @author xeolabs / http://xeolabs.com
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/quad",
 *      wire: false // Default
 *  });
 *  </pre>
 */
(function () {

    SceneJS.Types.addType("geometry/quad", {
        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        // TODO: support size properties like 'geometry/plane'

        var coreId = "geometry/quad" + (params.wire ? "wire" : "_solid");

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