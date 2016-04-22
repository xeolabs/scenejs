/**
 * @class An object within a {@link SceneJS_Display}
 * @private
 */
var SceneJS_Object = function(id) {

    /**
     * ID for this objects, unique among all objects in the display
     * @type Number
     */
    this.id = id;

    /**
     * Hash code for this object, unique among all objects in the display
     * @type String
     */
    this.hash = null;

    /**
     * State sort key, computed from {@link #layer}, {@link #program} and {@link #texture}
     * @type Number
     */
    this.sortKey = null;

    /**
     * Sequence of state chunks applied to render this object
     * @type {[SceneJS_Chunk]} chunks
     */
    this.chunks = [];

    /**
     * Number of state chunks applied to render this object
     * @type Number
     */
    this.chunksLen = 0;

    /**
     * Shader programs that render this object, also used for (re)computing {@link #sortKey}
     * @type SceneJS_Program
     */
    this.program = null;

    /**
     * State core for the {@link SceneJS.Layer} that this object was compiled from, used for (re)computing {@link #sortKey} and visibility cull
     */
    this.layer = null;

     /**
     * State core for the {@link SceneJS.Texture} that this object was compiled from, used for (re)computing {@link #sortKey}
     */
    this.texture = null;

    /**
     * State core for the {@link SceneJS.Flags} that this object was compiled from, used for visibility cull
     */
    this.flags = null;

    /**
     * State core for the {@link SceneJS.Tag} that this object was compiled from, used for visibility cull
     */
    this.tag = null;
};

(function() {
    var tempVec4 = SceneJS_math_vec4();
    var tempMat4 = SceneJS_math_mat4();

    SceneJS_Object.prototype.getDepth = function() {
        if (!this.centroid) {
            this.centroid = this._calculateCentroid(this);
        }

        this.modelTransform.build();
        this.viewTransform.rebuild();

        var modelMatrix = this.modelTransform.mat;
        var viewMatrix = this.viewTransform.mat;

        var mvMatrix = SceneJS_math_mulMat4(viewMatrix, modelMatrix, tempMat4);
        var viewCentroid = SceneJS_math_transformVector4(mvMatrix, this.centroid, tempVec4);

        return -viewCentroid[2];
    };

    SceneJS_Object.prototype._calculateCentroid = function() {

        var centroid = SceneJS_math_vec4();

        var positions = this.geometry.arrays.positions;
        var indices = this.geometry.arrays.indices;

        var xmin = Infinity;
        var ymin = Infinity;
        var zmin = Infinity;
        var xmax = -Infinity;
        var ymax = -Infinity;
        var zmax = -Infinity;

        var min = Math.min;
        var max = Math.max;

        for (var i = 0, len = indices.length; i < len; i++) {
            var vi = indices[i] * 3;
            var x = positions[vi];
            var y = positions[vi + 1];
            var z = positions[vi + 2];

            xmin = min(x, xmin);
            ymin = min(y, ymin);
            zmin = min(z, zmin);
            xmax = max(x, xmax);
            ymax = max(y, ymax);
            zmax = max(z, zmax);
        }

        centroid[0] = 0.5 * (xmin + xmax);
        centroid[1] = 0.5 * (ymin + ymax);
        centroid[2] = 0.5 * (zmin + zmax);
        centroid[3] = 1;

        return centroid;
    };
})();


