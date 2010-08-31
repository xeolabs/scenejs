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
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setAngle = function(angle) {
    this._angle = angle || 0;
    this._setDirty();
    return this;
};

/** Returns the rotation angle
 * @returns {float} The angle in degrees
 */
SceneJS.Rotate.prototype.getAngle = function() {
    return this._angle;
};

/**
 * Sets the rotation axis vector. The vector must not be of zero length.
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setXYZ = function(xyz) {
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

/** Returns the rotation axis vector.
 * @returns {object} The vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Rotate.prototype.getXYZ = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

/** Sets rotation axis vector's X component
 *
 * @param x
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setX = function(x) {
    this._x = x;
    this._setDirty();
    return this;
};

/** Returns the rotation axis vector's X component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getX = function() {
    return this._x;
};

/** Sets the rotation axis vector's Y component
 *
 * @param y
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setY = function(y) {
    this._y = y;
    this._setDirty();
    return this;
};

/** Returns the rotation axis vector's Y component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getY = function() {
    return this._y;
};

/** Sets the rotation axis vector's Z component
 *
 * @param z
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setZ = function(z) {
    this._z = z;
    this._setDirty();
    return this;
};

/** Returns the rotation axis vector's Z component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getZ = function() {
    return this._z;
};

SceneJS.Rotate.prototype._render = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        this._memoLevel = 1;
        if (this._x + this._y + this._z > 0) {

            /* When building a view transform, apply the negated rotation angle
             * to correctly transform the SceneJS.Camera
             */
            var angle = SceneJS._modelViewTransformModule.isBuildingViewTransform()
                    ? -this._angle
                    : this._angle;
            this._mat = SceneJS._math_rotationMat4v(angle * Math.PI / 180.0, [this._x, this._y, this._z]);
        } else {
            this._mat = SceneJS._math_identityMat4();
        }
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
