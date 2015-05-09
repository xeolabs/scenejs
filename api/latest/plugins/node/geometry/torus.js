/**
 * Torus geometry node type
 *
 * <p>Usage example showing defaults:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/torus",
 *`     radius: 1,
 *      tube: 0.3,
 *      segmentsR: 32,
 *      segmentsT: 24,
 *      arc: Math.PI / 2.0,
 *      wire: false
 *  });
 *  </pre>
 */
(function () {

    SceneJS.Types.addType("geometry/torus", {

        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        var radius = params.radius || 1;
        var tube = params.tube || 0.3;
        var segmentsR = params.segmentsR || 32;
        var segmentsT = params.segmentsT || 24;
        var arc = params.arc || Math.PI * 2;

        var coreId = "geometry/torus_" + (params.wire == true ? "wire_" : "") + radius + "_" + tube + "_" + segmentsR + "_" + segmentsT + "_" + arc;

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

        var u;
        var v;
        var centerX;
        var centerY;
        var centerZ = 0;
        var x;
        var y;
        var z;
        var vec;

        for (var j = 0; j <= segmentsR; j++) {
            for (var i = 0; i <= segmentsT; i++) {

                u = i / segmentsT * arc;
                v = j / segmentsR * Math.PI * 2;

                centerX = radius * Math.cos(u);
                centerY = radius * Math.sin(u);

                x = (radius + tube * Math.cos(v) ) * Math.cos(u);
                y = (radius + tube * Math.cos(v) ) * Math.sin(u);
                z = tube * Math.sin(v);

                positions.push(x);
                positions.push(y);
                positions.push(z);

                uvs.push(i / segmentsT);
                uvs.push(1 - j / segmentsR);

                vec = normalize(sub([x, y, z], [centerX, centerY, centerZ], []), []);

                normals.push(vec[0]);
                normals.push(vec[1]);
                normals.push(vec[2]);
            }
        }

        var a;
        var b;
        var c;
        var d;

        for (var j = 1; j <= segmentsR; j++) {
            for (var i = 1; i <= segmentsT; i++) {

                a = ( segmentsT + 1 ) * j + i - 1;
                b = ( segmentsT + 1 ) * ( j - 1 ) + i - 1;
                c = ( segmentsT + 1 ) * ( j - 1 ) + i;
                d = ( segmentsT + 1 ) * j + i;

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
            indices:indices
        };
    }

    function normalize(v, dest) {
        var f = 1.0 / len(v);
        return mul(v, f, dest);
    }

    function len(v) {
        return Math.sqrt(sqLen(v));
    }

    function sqLen(v) {
        return dot(v, v);
    }

    function dot(u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    }

    function mul(v, s, dest) {
        dest[0] = v[0] * s;
        dest[1] = v[1] * s;
        dest[2] = v[2] * s;
        return dest;
    }

    function sub(u, v, dest) {
        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        dest[2] = u[2] - v[2];
        return dest;
    }
})();