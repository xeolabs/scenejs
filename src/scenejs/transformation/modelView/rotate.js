/**
 * @class A scene node that applies a model-space rotation transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p>The rotation is described as a vector about which the rotation occurs, along with the angle or rotation in degrees.</p>
 * <p><b>Example</b></p><p>A cube rotated 45 degrees about its Y axis.</b></p><pre><code>
 * var rotate = new SceneJS.Rotate({
 *       angle: 45.0,    // Angle in degrees
 *       x: 0.0,         // Rotation vector points along positive Y axis
 *       y: 1.0,
 *       z: 0.0
 *   },
 *
 *      new SceneJS.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Rotate
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Rotate = SceneJS.createNodeType("rotate");

SceneJS.Rotate.prototype._init = function(params) {
    this._mat = null;
    this._xform = null;
    this.setAngle(params.angle);
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

/** Sets the rotation angle
 * @param {float} angle Rotation angle in degrees

 */
SceneJS.Rotate.prototype.setAngle = function(angle) {
    this._attr.angle = angle || 0;
    this._memoLevel = 0;
};

/** Returns the rotation angle
 * @returns {float} The angle in degrees
 */
SceneJS.Rotate.prototype.getAngle = function() {
    return this._attr.angle;
};

/**
 * Sets the rotation axis vector. The vector must not be of zero length.
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Rotate.prototype.setXYZ = function(xyz) {
    xyz = xyz || {};
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._attr.x = x;
    this._attr.y = y;
    this._attr.z = z;
    this._memoLevel = 0;
};

/** Returns the rotation axis vector.
 * @returns {object} The vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Rotate.prototype.getXYZ = function() {
    return {
        x: this._attr.x,
        y: this._attr.y,
        z: this._attr.z
    };
};

/** Sets rotation axis vector's X component
 *
 * @param x
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setX = function(x) {
    this._attr.x = x;
    this._memoLevel = 0;
};

/** Returns the rotation axis vector's X component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getX = function() {
    return this._attr.x;
};

/** Sets the rotation axis vector's Y component
 *
 * @param y
 */
SceneJS.Rotate.prototype.setY = function(y) {
    this._attr.y = y;
    this._memoLevel = 0;
};

/** Returns the rotation axis vector's Y component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getY = function() {
    return this._attr.y;
};

/** Sets the rotation axis vector's Z component
 *
 * @param z
 */
SceneJS.Rotate.prototype.setZ = function(z) {
    this._attr.z = z;
    this._memoLevel = 0;
};

/** Returns the rotation axis vector's Z component
 * @returns {float}
 */
SceneJS.Rotate.prototype.getZ = function() {
    return this._attr.z;
};

/** Increments the X component of the rotation vector
 *
 * @param x
 */
SceneJS.Rotate.prototype.incX = function(x) {
    this._attr.x += x;
    this._memoLevel = 0;
};

/** Increments the Y component of the rotation vector
 *
 * @param y
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.incY = function(y) {
    this._attr.y += y;
};

/** Inccrements the Z component of the rotation vector
 *
 * @param z
 */
SceneJS.Rotate.prototype.incZ = function(z) {
    this._attr.z += z;
    this._memoLevel = 0;
};

/** Increments the angle
 *
 * @param angle
 */
SceneJS.Rotate.prototype.incAngle = function(angle) {
    this._attr.angle += angle;
    this._memoLevel = 0;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]} The matrix elements
 */
SceneJS.Rotate.prototype.getMatrix = function() {
    return (this._memoLevel > 0)
            ? this._mat.slice(0)
            : SceneJS._math_rotationMat4v(this._attr.angle * Math.PI / 180.0, [this._attr.x, this._attr.y, this._attr.z]);
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.Rotate.prototype.getAttributes = function() {
    return {
        x: this._attr.x,
        y: this._attr.y,
        z: this._attr.z,
        angle : this._attr.angle
    };
};

// @private
SceneJS.Rotate.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Rotate.prototype._preCompile = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        this._memoLevel = 1;
        if (this._attr.x != 0 || this._attr.y != 0 || this._attr.z != 0) {

            /* When building a view transform, apply the negated rotation angle
             * to correctly transform the SceneJS.Camera
             */
            var angle = SceneJS._modelViewTransformModule.isBuildingViewTransform()
                    ? -this._attr.angle
                    : this._attr.angle;
            this._mat = SceneJS._math_rotationMat4v(angle * Math.PI / 180.0, [this._attr.x, this._attr.y, this._attr.z]);
        } else {
            this._mat = SceneJS._math_identityMat4();
        }
    }
    var superXForm = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXForm.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();
        var tempMat = SceneJS._math_mat4();
        SceneJS._math_mulMat4(superXForm.matrix, this._mat, tempMat);

        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: origMemoLevel == 2
        };

        if (this._memoLevel == 1 && superXForm.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS._modelViewTransformModule.pushTransform(this._attr.id, this._xform);
};

// @private
SceneJS.Rotate.prototype._postCompile = function(traversalContext) {
    SceneJS._modelViewTransformModule.popTransform();
};



