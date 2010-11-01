/**
 * @class A scene node that applies a model-space translate transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube translated along the X axis.</b></p><pre><code>
 * var translate = new SceneJS.Translate({
 *       x: 5.0,
 *       y: 0.0,
 *       z: 0.0
 *   },
 *
 *      new SceneJS.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Translate
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Translate = SceneJS.createNodeType("translate");

SceneJS.Translate.prototype._init = function(params) {
    this._mat = null;
    this._xform = null;
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

/**
 * Sets the translation vector
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setXYZ = function(xyz) {
    xyz = xyz || {};
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._x = x;
    this._y = y;
    this._z = z;
    this._setDirty();
    return this;
};

/** Returns the translation vector
 * @returns {Object} the vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Translate.prototype.getXYZ = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

/** Sets the X component of the translation vector
 *
 * @param x
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setX = function(x) {
    this._x = x;
    this._setDirty();
    return this;
};

/** Returns the X component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getX = function() {
    return this._x;
};

/** Sets the Y component of the translation vector
 *
 * @param y
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setY = function(y) {
    this._y = y;
    this._setDirty();
    return this;
};

/** Returns the Y component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getY = function() {
    return this._y;
};

/** Sets the Z component of the translation vector
 *
 * @param z
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setZ = function(z) {
    this._z = z;
    this._setDirty();
    return this;
};

/** Gets the Z component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getZ = function() {
    return this._z;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]} The matrix elements
 */
SceneJS.Translate.prototype.getMatrix = function() {
    return (this._memoLevel > 0) ? this._mat.slice(0) : SceneJS._math_translationMat4v([this._x, this._y, this._z]);
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.Translate.prototype.getAttributes = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

SceneJS.Translate.prototype._render = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        if (SceneJS._modelViewTransformModule.isBuildingViewTransform()) {

            /* When building a view transform, apply the negated translation vector
             * to correctly transform the SceneJS.Camera
             */
            this._mat = SceneJS._math_translationMat4v([-this._x, -this._y, -this._z]);
        } else {
            this._mat = SceneJS._math_translationMat4v([this._x, this._y, this._z]);
        }
        this._memoLevel = 1;
    }
    var superXForm = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXForm.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();

        var tempMat = SceneJS._math_mulMat4(superXForm.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: origMemoLevel == 2
        };

        if (this._memoLevel == 1 && superXForm.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS._modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext);
    SceneJS._modelViewTransformModule.setTransform(superXForm);
};
