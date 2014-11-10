/**
 * Plane geometry node type
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "prims/plane",
 *      width: 10,
 *      height: 20,
 *      wire: false // Default
 *  });
 */
(function () {

    SceneJS.Types.addType("prims/plane", {

        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        var width = params.width || 1.0;
        var height = params.height || 1.0;

        var widthSegments = params.widthSegments || 1;
        var heightSegments = params.heightSegments || 1;

        var coreId = "prims/plane_" + (params.wire == true ? "wire_" : "") + height + "_" + widthSegments + "_" + heightSegments;

        // If a node core already exists for a prim with the given properties,
        // then for efficiency we'll share that core rather than create another geometry
        if (this.getScene().hasCore("geometry", coreId)) {
            return {
                type: "geometry",
                coreId:coreId
            };
        }

        // Otherwise, create a new geometry

        var positions = [];
        var normals = [];
        var uvs = [];
        var indices = [];

        var ix, iz;
        var halfWidth = width / 2;
        var halfHeight = height / 2;

        var gridX = widthSegments;
        var gridZ = heightSegments;

        var gridX1 = gridX + 1;
        var gridZ1 = gridZ + 1;

        var segWidth = width / gridX;
        var segHeight = height / gridZ;

        var x;
        var y;

        for (iz = 0; iz < gridZ1; iz++) {
            for (ix = 0; ix < gridX1; ix++) {

                x = ix * segWidth - halfWidth;
                y = iz * segHeight - halfHeight;

                positions.push(x);
                positions.push(-y);
                positions.push(0);

                normals.push(0);
                normals.push(0);
                normals.push(1);

                uvs.push(ix / gridX);
                uvs.push(1 - iz / gridZ);
            }
        }

        var a;
        var b;
        var c;
        var d;

        for (iz = 0; iz < gridZ; iz++) {
            for (ix = 0; ix < gridX; ix++) {

                a = ix + gridX1 * iz;
                b = ix + gridX1 * ( iz + 1 );
                c = ( ix + 1 ) + gridX1 * ( iz + 1 );
                d = ( ix + 1 ) + gridX1 * iz;

                indices.push(a);
                indices.push(b);
                indices.push(c);

                indices.push(c);
                indices.push(d);
                indices.push(a);
            }
        }

        return {
            type: "geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId:coreId,
            positions:new Float32Array(positions),
            normals:new Float32Array(normals),
            uv:new Float32Array(uvs),
            indices:new Uint16Array(indices)
        };
    }
})();
