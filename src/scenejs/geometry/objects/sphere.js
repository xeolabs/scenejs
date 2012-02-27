(function() {

    /**
     * @class A scene node that defines sphere geometry.
     * <p>The geometry is complete with normals for shading and one layer of UV coordinates for
     * texture-mapping.</p>
     * <p><b>Example Usage</b></p><p>Definition of sphere with a radius of 6 units:</b></p><pre><code>
     * var c = new Sphere({
     *            radius: 6
     *          slices: 30,          // Optional number of longitudinal slices (30 is default)
     *          rings: 30,           // Optional number of latitudinal slices (30 is default)
     *          semiMajorAxis: 1.5,  // Optional semiMajorAxis results in elliptical sphere (default of 1 creates sphere)
     *          sweep: 0.75,         // Optional rotational extrusion (1 is default)
     *          sliceDepth: 0.25,    // Optional depth of slices to generate from top to bottom (1 is default)
     (1 is default)
     *     })
     * </pre></code>
     * @extends SceneJS.Geometry
     * @since Version 0.7.4
     * @constructor
     * Create a new Sphere
     * @param {Object} [cfg] Static configuration object
     * @param {float} [cfg.slices=30] Number of longitudinal slices
     * @param {float} [cfg.rings=30] Number of longitudinal slices
     * @param {float} [cfg.semiMajorAxis=1.0] values other than one generate an elliptical sphere
     * @param {float} [cfg.sweep=1]  rotational extrusion, default is 1
     * @param {float} [cfg.sliceDepth=1]  depth of slices to generate, default is 1
     * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
     * @param {...SceneJS_node} [childNodes] Child nodes
     */
    var Sphere = SceneJS.createNodeType("sphere", "geometry");

    Sphere.prototype._init = function(params) {
        var slices = params.slices || 30;
        var rings = params.rings || 30;
        var radius = params.radius || 1;

        var semiMajorAxis = params.semiMajorAxis || 1;
        var semiMinorAxis = 1 / semiMajorAxis;

        var sweep = params.sweep || 1;
        if (sweep > 1) {
            sweep = 1
        }

        var sliceDepth = params.sliceDepth || 1;
        if (sliceDepth > 1) {
            sliceDepth = 1
        }

        var ringLimit = rings * sweep;
        var sliceLimit = slices * sliceDepth;

        SceneJS_geometry.prototype._init.call(this, {

            /* Core ID ensures that we reuse any sphere that has already been created with
             * these parameters instead of wasting memory
             */
            coreId : params.coreId || "sphere_" + radius + "_" + rings + "_" + slices + "_" + semiMajorAxis + "_" + sweep + "_" + sliceDepth,

            /* Optional pre-applied static model-space transforms
             */
            scale: params.scale,
            origin: params.origin,

            /* Callback that does the creation in case we can't find matching sphere to reuse
             */
            create : function() {
                var positions = [];
                var normals = [];
                var uv = [];
                var ringNum, sliceNum, index;

                for (sliceNum = 0; sliceNum <= slices; sliceNum++) {
                    if (sliceNum > sliceLimit) break;
                    var theta = sliceNum * Math.PI / slices;
                    var sinTheta = Math.sin(theta);
                    var cosTheta = Math.cos(theta);

                    for (ringNum = 0; ringNum <= rings; ringNum++) {
                        if (ringNum > ringLimit) break;
                        var phi = ringNum * 2 * Math.PI / rings;
                        var sinPhi = semiMinorAxis * Math.sin(phi);
                        var cosPhi = semiMajorAxis * Math.cos(phi);

                        var x = cosPhi * sinTheta;
                        var y = cosTheta;
                        var z = sinPhi * sinTheta;
                        var u = 1 - (ringNum / rings);
                        var v = sliceNum / slices;

                        normals.push(x);
                        normals.push(y);
                        normals.push(z);
                        uv.push(u);
                        uv.push(v);
                        positions.push(radius * x);
                        positions.push(radius * y);
                        positions.push(radius * z);
                    }
                }

                // create a center point which is only used when sweep or sliceDepth are less than one
                if (sliceDepth < 1) {
                    var yPos = Math.cos((sliceNum - 1) * Math.PI / slices) * radius;
                    positions.push(0, yPos, 0);
                    normals.push(1, 1, 1);
                    uv.push(1, 1);
                } else {
                    positions.push(0, 0, 0);
                    normals.push(1, 1, 1);
                    uv.push(1, 1);
                }

                // index of the center position point in the positions array
                // var centerIndex = (ringLimit + 1) *  (sliceLimit);
                var centerIndex = positions.length / 3 - 1;

                var indices = [];

                for (sliceNum = 0; sliceNum < slices; sliceNum++) {
                    if (sliceNum >= sliceLimit) break;
                    for (ringNum = 0; ringNum < rings; ringNum++) {
                        if (ringNum >= ringLimit) break;
                        var first = (sliceNum * (ringLimit + 1)) + ringNum;
                        var second = first + ringLimit + 1;
                        indices.push(first);
                        indices.push(second);
                        indices.push(first + 1);

                        indices.push(second);
                        indices.push(second + 1);
                        indices.push(first + 1);
                    }
                    if (rings >= ringLimit) {
                        // We aren't sweeping the whole way around so ...
                        //  indices for a sphere with fours ring-segments when only two are drawn.
                        index = (ringLimit + 1) * sliceNum;
                        //    0,3,15   2,5,15  3,6,15  5,8,15 ...
                        indices.push(index, index + ringLimit + 1, centerIndex);
                        indices.push(index + ringLimit, index + ringLimit * 2 + 1, centerIndex);
                    }
                }

                if (slices > sliceLimit) {
                    // We aren't sweeping from the top all the way to the bottom so ...
                    for (ringNum = 1; ringNum <= ringLimit; ringNum++) {
                        index = sliceNum * ringLimit + ringNum;
                        indices.push(index, index + 1, centerIndex);
                    }
                    indices.push(index + 1, sliceNum * ringLimit + 1, centerIndex);
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