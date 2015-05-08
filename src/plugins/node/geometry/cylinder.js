/**
 * Sphere geometry node type
 *
 * @author Moritz Kornher / https://github.com/mrgrain
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/cylinder",
 *      radiusTop: 20, // Default
 *      radiusBottom: 20, // Default
 *      height: 100, // Default
 *      radialSegments: 8, // Default
 *      heightSegments: 1, // Default
 *      openEnded: false // Default
 *  });
 *  </pre>
 */

(function () {

    SceneJS.Types.addType("geometry/cylinder", {

        init:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        // Thanks awfully to: http://www.e-reading-lib.com/bookreader.php/143437/Pike_-_DirectX_8_Programming_Tutorial.html

        /* config */
        var radiusTop = params.radiusTop !== undefined ? params.radiusTop : 1;
        var radiusBottom = params.radiusBottom !== undefined ? params.radiusBottom : 1;
        var height = params.height !== undefined ? params.height : 1;

        var radialSegments   = params.radialSegments  || 60;
        var heightSegments   = params.heightSegments  || 1;

        var openEnded = params.openEnded || false;
        /* config end */

        var heightHalf = height / 2;
        var heightLength = height / heightSegments;

        var radialAngle = (2.0 * Math.PI / radialSegments);
        var radialLength = 1.0 / radialSegments;

        var nextRadius = this.radiusBottom;
        var radiusChange = (radiusTop-radiusBottom)/heightSegments;

        var positions = [];
        var normals = [];
        var uvs = [];
        var indices = [];

        // create vertices
        var normalY = (90.0 - (Math.atan(height / (radiusBottom - radiusTop))) * 180/Math.PI) / 90.0;

        for (var h = 0; h <= heightSegments; h++) {
            var currentRadius = radiusTop - h*radiusChange;
            var currentHeight = heightHalf - h*heightLength

            for (var i=0; i <= radialSegments; i++) {
                var x = Math.sin(i * radialAngle);
                var z = Math.cos(i * radialAngle);

                normals.push(currentRadius * x);
                normals.push(normalY); //todo
                normals.push(currentRadius * z);
                uvs.push(1 - (i*radialLength));
                uvs.push(0 + h*1/heightSegments);
                positions.push(currentRadius * x);
                positions.push(currentHeight);
                positions.push(currentRadius * z);
            }
        }

        // create faces
        for (var h = 0; h < heightSegments; h++) {
            for (var i=0; i <= radialSegments; i++) {
                var first = h * (radialSegments + 1) + i;
                var second = first + radialSegments;
                indices.push(first);
                indices.push(second);
                indices.push(second + 1);

                indices.push(first);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        // create top cap
        if (!openEnded && radiusTop > 0) {
            var startIndex = (positions.length/3);

            // top center
            normals.push(0.0);
            normals.push(1.0);
            normals.push(0.0);
            uvs.push(0.5);
            uvs.push(0.5);
            positions.push(0);
            positions.push(heightHalf);
            positions.push(0);

            // top triangle fan
            for (var i=0; i <= radialSegments; i++) {
                var x = Math.sin(i * radialAngle);
                var z = Math.cos(i * radialAngle);
                var tu = (0.5 * Math.sin(i * radialAngle)) + 0.5;
                var tv = (0.5 * Math.cos(i * radialAngle)) + 0.5;

                normals.push(radiusTop * x);
                normals.push(1.0);
                normals.push(radiusTop * z);
                uvs.push(tu);
                uvs.push(tv);
                positions.push(radiusTop * x);
                positions.push(heightHalf);
                positions.push(radiusTop * z);
            }

            for (var i=0; i < radialSegments; i++) {
                var center = startIndex;
                var first = startIndex + 1 + i;
                indices.push(first);
                indices.push(first + 1);
                indices.push(center);
            }
        }

        // create bottom cap
        if (!openEnded && radiusBottom > 0) {
            var startIndex = (positions.length/3);

            // top center
            normals.push(0.0);
            normals.push(-1.0);
            normals.push(0.0);
            uvs.push(0.5);
            uvs.push(0.5);
            positions.push(0);
            positions.push(0-heightHalf);
            positions.push(0);

            // top triangle fan
            for (var i=0; i <= radialSegments; i++) {
                var x = Math.sin(i * radialAngle);
                var z = Math.cos(i * radialAngle);
                var tu = (0.5 * Math.sin(i * radialAngle)) + 0.5;
                var tv = (0.5 * Math.cos(i * radialAngle)) + 0.5;

                normals.push(radiusBottom * x);
                normals.push(-1.0);
                normals.push(radiusBottom * z);
                uvs.push(tu);
                uvs.push(tv);
                positions.push(radiusBottom * x);
                positions.push(0-heightHalf);
                positions.push(radiusBottom * z);
            }

            for (var i=0; i < radialSegments; i++) {
                var center = startIndex;
                var first = startIndex + 1 + i;
                indices.push(first);
                indices.push(first + 1);
                indices.push(center);
            }
        }

        return {
            type: "geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId : "cylinder_" + (params.wire ? "wire" : "solid") + "_" + (params.openEnded ? "open" : "closed") + "_"
                + radiusTop + "_" + radiusBottom + "_" + radialSegments + "_"
                + height + "_" + heightSegments,
            positions : new Float32Array(positions),
            normals: new Float32Array(normals),
            uv : new Float32Array(uvs),
            indices : indices
        };
    }
})();
