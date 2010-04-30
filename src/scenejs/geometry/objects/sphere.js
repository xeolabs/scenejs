SceneJS._utils.ns("SceneJS.objects");


/**
 * @class SceneJS.objects.Sphere
 * @extends SceneJS.Geometry
 * <p>A scene node that defines sphere geometry, complete with normals for shading and one layer of UV coordinates for
 * texture-mapping. A Sphere may be configured with an optional radius, which will be 1 by default.</p>
 * <p><b>Example Usage</b></p><p>Definition of sphere with a radius of 6 units:</b></p><pre><code>
 * var c = new SceneJS.objects.Sphere({
 *          slices: 30,     // Optional number of longitudinal slices (30 is default)
 *          rings: 30,      // Optional number of latitudinal slices (30 is default)
 *          radius : 6      // Optional radius (1 is default)
 *     })
 * </pre></code>
 * @constructor
 * Create a new SceneJS.objects.Sphere
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.objects.Sphere = function() {
    SceneJS.Geometry.apply(this, arguments);
    this._nodeType = "sphere";
};

SceneJS._utils.inherit(SceneJS.objects.Sphere, SceneJS.Geometry);

// @private
SceneJS.objects.Sphere.prototype._init = function(params) {
    var slices = params.slices || 30;
    var rings = params.rings || 30;

    /* Type ID ensures that we reuse any sphere that has already been created with
     * these parameters instead of wasting memory
     */
    this._type = "sphere_" + rings + "_" + slices;

    /* Callback that does the creation in case we can't find matching sphere to reuse     
     */
    this._create = function() {
        var radius = 1;
        var positions = [];
        var normals = [];
        var uv = [];
        for (var sliceNum = 0; sliceNum <= slices; sliceNum++) {
            var theta = sliceNum * Math.PI / slices;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var ringNum = 0; ringNum <= rings; ringNum++) {
                var phi = ringNum * 2 * Math.PI / rings;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (ringNum / rings);
                var v = sliceNum / slices;

                normals.push(-x);
                normals.push(-y);
                normals.push(-z);
                uv.push(u);
                uv.push(v);
                positions.push(radius * x);
                positions.push(radius * y);
                positions.push(radius * z);
            }
        }

        var indices = [];
        for (var sliceNum = 0; sliceNum < slices; sliceNum++) {
            for (var ringNum = 0; ringNum < rings; ringNum++) {
                var first = (sliceNum * (rings + 1)) + ringNum;
                var second = first + rings + 1;
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);

                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        return {
            primitive : "triangles",
            positions : positions,
            normals: normals,
            uv : uv,
            indices : indices
        };
    };
};


/** Function wrapper to support functional scene definition
 */
SceneJS.objects.sphere = function() {
    var n = new SceneJS.objects.Sphere();
    SceneJS.objects.Sphere.prototype.constructor.apply(n, arguments);
    return n;
};