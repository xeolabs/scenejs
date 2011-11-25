(function() {

    /**
     * @class A scene node that defines a disk geometry.
     * <p>The geometry is complete with normals for shading and one layer of UV coordinates for
     * texture-mapping. It can also be configured as solid (default), to construct it from
     * triangles with normals for shading and one layer of UV coordinates for texture-mapping
     * When not solid, it will be a wireframe drawn as line segments.</p>
     * <p><b>Example Usage</b></p><p>Definition of solid disk that extends 6 units radially from the Y-axis,
     * is elliptical in shape with a normalized semiMajorAxis of 1.5, is 2 units high in the Y-axis and
     * is made up of 48 longitudinal rings:</b></p><pre><code>
     * var c = new Disk({
     *          radius: 6,          // Optional radius (1 is default)
     *          innerRadius: 3     // Optional innerRadius results in ring (default is 0)
     *          semiMajorAxis: 1.5  // Optional semiMajorAxis results in ellipse (default is 1 which is a circle)
     *          height: 2,          // Optional height (1 is default)
     *          rings: 48           // Optional number of longitudinal rings (30 is default)
     *     })
     * </pre></code>
     * @extends SceneJS.Geometry
     * @since Version 0.7.9
     * @constructor
     * Create a new Disk
     * @param {Object} [cfg] Static configuration object
     * @param {float} [cfg.radius=1.0] radius extending from Y-axis
     * @param {float} [cfg.innerRadius=0] inner radius extending from Y-axis
     * @param {float} [cfg.innerRadius=0] inner radius extending from Y-axis
     * @param {float} [cfg.semiMajorAxis=1.0] values other than one generate an ellipse
     * @param {float} [cfg.rings=30]  number of longitudinal rings
     * @param {...SceneJS_node} [childNodes] Child nodes
     */
    var Disk = SceneJS.createNodeType("disk", "geometry");

    Disk.prototype._init = function(params) {
        this.attr.type = "disk";

        var radius = params.radius || 1;
        var height = params.height || 1;
        var rings = params.rings || 30;
        var innerRadius = params.innerRadius || 0;
        if (innerRadius > radius) {
            innerRadius = radius
        }

        var semiMajorAxis = params.semiMajorAxis || 1;
        var semiMinorAxis = 1 / semiMajorAxis;

        var sweep = params.sweep || 1;
        if (sweep > 1) {
            sweep = 1
        }

        var ringLimit = rings * sweep;

        SceneJS_geometry.prototype._init.call(this, {

            /* Resource ID ensures that we reuse any sphere that has already been created with
             * these parameters instead of wasting memory
             */
            coreId : params.coreId || "disk_" + radius + "_" + height + "_" + rings + "_" + innerRadius + "_" + semiMajorAxis + "_" + sweep,

            /* Callback that does the creation in case we can't find matching disk to reuse
             */
            create : function() {
                var positions = [];
                var normals = [];
                var uv = [];

                var ybot = height * -0.5;
                var ytop = height * 0.5;

                for (var ringNum = 0; ringNum <= rings; ringNum++) {
                    if (ringNum > ringLimit) break;
                    var phi = ringNum * 2 * Math.PI / rings;
                    var sinPhi = semiMinorAxis * Math.sin(phi);
                    var cosPhi = semiMajorAxis * Math.cos(phi);

                    var x = cosPhi;
                    var z = sinPhi;
                    var u = 1 - (ringNum / rings);
                    var v = 0.5;

                    //
                    // create the outer set of vertices,
                    // one for the bottom and one for the top
                    //
                    normals.push(-x);
                    normals.push(1);
                    normals.push(-z);
                    uv.push(u);
                    uv.push(v);
                    positions.push(radius * x);
                    positions.push(ybot);
                    positions.push(radius * z);

                    normals.push(-x);
                    normals.push(-1);
                    normals.push(-z);
                    uv.push(u);
                    uv.push(v);
                    positions.push(radius * x);
                    positions.push(ytop);
                    positions.push(radius * z);

                    if (innerRadius > 0) {
                        //
                        // Creating a disk with a hole in the middle ...
                        // generate the inner set of vertices,
                        // one for the bottom and one for the top
                        //
                        normals.push(-x);
                        normals.push(-ytop);
                        normals.push(-z);
                        uv.push(u);
                        uv.push(v);
                        positions.push(innerRadius * x);
                        positions.push(ytop);
                        positions.push(innerRadius * z);

                        normals.push(-x);
                        normals.push(-ybot);
                        normals.push(-z);
                        uv.push(u);
                        uv.push(v);
                        positions.push(innerRadius * x);
                        positions.push(ybot);
                        positions.push(innerRadius * z);
                    }

                }

                var indices = [];

                //
                // Create indices pointing to vertices for the top, bottom
                // and optional endcaps for the disk
                //

                if (innerRadius > 0) {
                    //
                    // Creating a disk with a hole in the middle ...
                    // Each ring sengment rquires a quad surface on the top and bottom
                    // so create two traingles for the top and two for the bottom.
                    //
                    var index;
                    for (var ringNum = 0; ringNum < rings; ringNum++) {
                        if (ringNum >= ringLimit) {
                            // We aren't sweeping the whole way around so also create triangles to cap the ends.
                            // Example: indices for a disk with fours ring-segments when only two are drawn.
                            //   0,1,2   0,2,3  8,9,10  8,10,11
                            indices.push(0, 1, 2);
                            indices.push(0, 2, 3);
                            index = ringLimit * 4;
                            indices.push(index, index + 1, index + 2);
                            indices.push(index, index + 2, index + 3);
                            break;
                        }
                        index = ringNum * 4;

                        indices.push(index + 0);
                        indices.push(index + 1);
                        indices.push(index + 4);

                        indices.push(index + 1);
                        indices.push(index + 4);
                        indices.push(index + 5);

                        indices.push(index + 1);
                        indices.push(index + 2);
                        indices.push(index + 5);

                        indices.push(index + 2);
                        indices.push(index + 5);
                        indices.push(index + 6);

                        indices.push(index + 2);
                        indices.push(index + 3);
                        indices.push(index + 6);

                        indices.push(index + 3);
                        indices.push(index + 6);
                        indices.push(index + 7);

                        indices.push(index + 3);
                        indices.push(index + 0);
                        indices.push(index + 7);

                        indices.push(index + 0);
                        indices.push(index + 7);
                        indices.push(index + 4);
                    }

                } else {
                    //
                    // Create a solid disk without a hole in the middle ...
                    // So only a single top and bottom triangle are needed
                    //
                    normals.push(0, 1.0, 0);
                    uv.push(-1, -1);
                    positions.push(0, ybot, 0);
                    var centerBot = ringLimit * 2 + 2;

                    normals.push(0, -1.0, 0);
                    uv.push(-1, -1);
                    positions.push(0, ytop, 0);
                    var centerTop = ringLimit * 2 + 3;

                    for (var ringNum = 0; ringNum < rings; ringNum++) {
                        //  generate the two outer-facing triangles for each ring segment
                        if (ringNum >= ringLimit) break;
                        var index = ringNum * 2;
                        indices.push(index);
                        indices.push(index + 1);
                        indices.push(index + 2);

                        indices.push(index + 1);
                        indices.push(index + 2);
                        indices.push(index + 3);
                    }

                    for (var ringNum = 0; ringNum < rings; ringNum++) {
                        //  generate the top and bottom triabgkle for each ring segment
                        if (ringNum >= ringLimit) break;
                        var index = ringNum * 2;
                        indices.push(index);
                        indices.push(index + 2);
                        indices.push(centerBot);

                        indices.push(index + 1);
                        indices.push(index + 3);
                        indices.push(centerTop);
                    }

                    if (rings >= ringLimit) {
                        // We aren't sweeping the whole way around so create triangles to cap the ends.
                        // Example: indices for a disk with fours ring-segments when only two are drawn.
                        //   0,1,2   0,2,3  8,9,10  8,10,11
                        index = ringLimit * 2;
                        indices.push(0, 1, index);
                        indices.push(1, index + 1, index);
                    }

                }
                
                return {
                    primitive : "triangles",
                    positions : positions,
                    normals: normals,
                    uv : uv,
                    indices : indices
                };
            }
        });
    };

})();
