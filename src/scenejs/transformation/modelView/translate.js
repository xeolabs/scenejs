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
    this.setXyz({x : params.x, y: params.y, z: params.z });
};

/**
 * Sets the translation vector
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Translate.prototype.setXyz = function(xyz) {
    xyz = xyz || {};
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._attr.x = x;
    this._attr.y = y;
    this._attr.z = z;
    this._memoLevel = 0;
};

/** Returns the translation vector
 * @returns {Object} the vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Translate.prototype.getXyz = function() {
    return {
        x: this._attr.x,
        y: this._attr.y,
        z: this._attr.z
    };
};

/** Sets the X component of the translation vector
 *
 * @param x
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setX = function(x) {
    this._attr.x = x;
    this._memoLevel = 0;
};

/** Returns the X component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getX = function() {
    return this._attr.x;
};

/** Sets the Y component of the translation vector
 *
 * @param y
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setY = function(y) {
    this._attr.y = y;
    this._memoLevel = 0;
};

/** Returns the Y component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getY = function() {
    return this._attr.y;
};

/** Sets the Z component of the translation vector
 *
 * @param z
 */
SceneJS.Translate.prototype.setZ = function(z) {
    this._attr.z = z;
    this._memoLevel = 0;
};

/** Gets the Z component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getZ = function() {
    return this._attr.z;
};

/** Increments the X component of the translation vector
 *
 * @param x
 */
SceneJS.Translate.prototype.incX = function(x) {
    this._attr.x += x;
    this._memoLevel = 0;
};

/** Increments the Y component of the translation vector
 *
 * @param y
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.incY = function(y) {
    this._attr.y += y;
};

/** Inccrements the Z component of the translation vector
 *
 * @param z
 */
SceneJS.Translate.prototype.incZ = function(z) {
    this._attr.z += z;
    this._memoLevel = 0;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]} The matrix elements
 */
SceneJS.Translate.prototype.getMatrix = function() {
    return (this._memoLevel > 0) ? this._mat.slice(0) : SceneJS_math_translationMat4v([this._attr.x, this._attr.y, this._attr.z]);
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.Translate.prototype.getAttributes = function() {
    return {
        x: this._attr.x,
        y: this._attr.y,
        z: this._attr.z
    };
};

// @private
SceneJS.Translate.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Translate.prototype._preCompile = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        if (SceneJS_modelViewTransformModule.isBuildingViewTransform()) {

            /* When building a view transform, apply the negated translation vector
             * to correctly transform the SceneJS.Camera
             */
            this._mat = SceneJS_math_translationMat4v([-this._attr.x, -this._attr.y, -this._attr.z]);
        } else {
            this._mat = SceneJS_math_translationMat4v([this._attr.x, this._attr.y, this._attr.z]);
        }
        this._memoLevel = 1;
    }
    var superXForm = SceneJS_modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXForm.fixed)) {
        var instancing = SceneJS_instancingModule.instancing();

        var tempMat = SceneJS_math_mat4();
        SceneJS_math_mulMat4(superXForm.matrix, this._mat, tempMat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: origMemoLevel == 2
        };

        if (this._memoLevel == 1 && superXForm.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.pushTransform(this._attr.id, this._xform);
};

// @private
SceneJS.Translate.prototype._postCompile = function(traversalContext) {
    SceneJS_modelViewTransformModule.popTransform();
};
