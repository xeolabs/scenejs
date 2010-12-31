/**
 * @class A scene node that applies a model-space scale transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube scaled to become a flat square tile.</b></p><pre><code>
 * var scale = new SceneJS.Scale({
 *       x: 5.0,
 *       y: 5.0,
 *       z: 0.5
 *   },
 *
 *      new SceneJS.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Scale
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Scale = SceneJS.createNodeType("scale");

SceneJS.Scale.prototype._init = function(params) {
    this._mat = null;
    this._xform = null;
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

/**
 * Sets all scale factors.
 * @param {object} xyz The factors - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setXYZ = function(xyz) {
    xyz = xyz || {};
    this._attr.x = (xyz.x != undefined) ? xyz.x : 1;
    this._attr.y = (xyz.y != undefined) ? xyz.y : 1;
    this._attr.z = (xyz.z != undefined) ? xyz.z : 1;
    this._setDirty();
    return this;
};

/** Returns the scale factors.
 * @returns {Object} the factors, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Scale.prototype.getXYZ = function() {
    return {
        x: this._attr.x,
        y: this._attr.y,
        z: this._attr.z
    };
};

/** Sets the X scale factor
 *
 * @param x
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setX = function(x) {
    this._attr.x = (x != undefined && x != null) ? x : 1.0;
    this._setDirty();
    return this;
};

/** Returns the X scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getX = function() {
    return this._attr.x;
};

/** Sets the Y scale factor
 *
 * @param y
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setY = function(y) {
    this._attr.y = (y != undefined && y != null) ? y : 1.0;
    this._setDirty();
    return this;
};

/** Returns the Y scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getY = function() {
    return this._attr.y;
};

/** Sets the Z scale factor
 *
 * @param z
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setZ = function(z) {
    this._attr.z = (z != undefined && z != null) ? z : 1.0;
    this._setDirty();
    return this;
};

/** Gets the Z scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getZ = function() {
    return this._attr.z;
};

/** Increments the X component of the scale factor
 *
 * @param x
 */
SceneJS.Scale.prototype.incX = function(x) {
    this._attr.x += x;
    this._memoLevel = 0;
};

/** Increments the Y component of the scale factor
 *
 * @param y
 */
SceneJS.Scale.prototype.incY = function(y) {
    this._attr.y += y;
};

/** Increments the Z component of the scale factor
 *
 * @param z
 */
SceneJS.Scale.prototype.incZ = function(z) {
    this._attr.z += z;
    this._memoLevel = 0;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]} The matrix elements
 */
SceneJS.Scale.prototype.getMatrix = function() {
    return (this._memoLevel > 0) ? this._mat.slice(0) : SceneJS._math_scalingMat4v([this._attr.x, this._attr.y, this._attr.z]);
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.Scale.prototype.getAttributes = function() {
    return {
        x: this._attr.x,
        y: this._attr.y,
        z: this._attr.z
    };
};

SceneJS.Scale.prototype._render = function(traversalContext) {

    var origMemoLevel = this._memoLevel;

    if (this._memoLevel == 0) {
        this._memoLevel = 1;
        this._mat = SceneJS._math_scalingMat4v([this._attr.x, this._attr.y, this._attr.z]);
    }
    var superXform = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXform.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();

        var tempMat = SceneJS._math_mat4(); 
        SceneJS._math_mulMat4(superXform.matrix, this._mat, tempMat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: origMemoLevel == 2
        };

        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS._modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext);
    SceneJS._modelViewTransformModule.setTransform(superXform);
};
