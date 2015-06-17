/**
 * Sphere geometry node type
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/sphere",
 *      latitudeBands: 30, // Default
 *      longitudeBands: 30, // Default
 *      radius: 1, // Default
 *      wire: false // Default
 *  });
 *  </pre>
 */
(function () {

    SceneJS.Types.addType("geometry/sphere", {

        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        // Thanks awfully to: http://learningwebgl.com/cookbook/index.php/How_to_draw_a_sphere

        var latitudeBands = params.latitudeBands || 30;
        var longitudeBands = params.longitudeBands || 30;
        var radius = params.radius || 1;

        var coreId = "geometry/sphere_" + (params.wire ? "wire" : "_solid") + radius + "_" + longitudeBands + "_" + latitudeBands;

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
        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = longNumber / longitudeBands;
                var v = latNumber / latitudeBands;

                normals.push(x);
                normals.push(y);
                normals.push(z);
                uvs.push(u);
                uvs.push(v);
                positions.push(radius * x);
                positions.push(radius * y);
                positions.push(radius * z);
            }
        }

        var indices = [];
        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indices.push(first + 1);
                indices.push(second + 1);
                indices.push(second);
                indices.push(first + 1);
                indices.push(second);
                indices.push(first);
            }
        }

        return {
            type: "geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId : coreId,
            positions : new Float32Array(positions),
            normals: new Float32Array(normals),
            uv : new Float32Array(uvs),
            indices : indices // Type will be decided internally
        };
    }
})();