/**
 * @class SceneJS.Rotate
 * @extends SceneJS.Node
 * <p>Scene node that applies a model-space rotation transform to the nodes within its subgraph.</p><p>The rotation
 * is described as a vector about which the rotation occurs, along with the angle or rotation in degrees.</p>
 * <p><b>Example</b></p><p>A cube rotated 45 degrees about its Y axis.</b></p><pre><code>
 * var rotate = new SceneJS.Rotate({
 *       angle: 45.0,    // Angle in degrees
 *       x: 0.0,         // Rotation vector points along positive Y axis
 *       y: 1.0,
 *       z: 0.0
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Rotate
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Rotate = function() {
    SceneJS.Node.apply(this, arguments);
    this._mat = null;
    this._xform = null;
    this._angle = 0;
    this._x = 0;
    this._y = 0;
    this._z = 1;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._utils.inherit(SceneJS.Rotate, SceneJS.Node);

/** Sets the rotation angle
 * @param {float} angle Rotation angle in degrees
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setAngle = function(angle) {
    this._angle = angle || 0;
    this._memoLevel = 0;
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
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
//    if (x + y + z == 0) {
//        SceneJS_errorModule.fatalError(
//                new SceneJS.exceptions.IllegalRotateConfigException(
//                        "SceneJS.rotate vector is zero - at least one of properties x,y and z must be non-zero"));
//    }
    this._x = x;
    this._y = y;
    this._z = z;
    this._memoLevel = 0;
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
    this._memoLevel = 0;
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
    this._memoLevel = 0;
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
    this._memoLevel = 0;
    return this;
};

/** Returns the rotation axis vector's Z component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getZ = function() {
    return this._z;
};

SceneJS.Rotate.prototype._init = function(params) {
    if (params.angle) {
        this.setAngle(params.angle);
    }
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

SceneJS.Rotate.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_rotationMat4v(this._angle * Math.PI / 180.0, [this._x, this._y, this._z]);
    }
    var superXform = SceneJS_modelTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.rotate = function() {
    var n = new SceneJS.Rotate();
    SceneJS.Rotate.prototype.constructor.apply(n, arguments);
    return n;
};
