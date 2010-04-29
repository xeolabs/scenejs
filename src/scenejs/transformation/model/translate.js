/**
 * @class SceneJS.Translate
 * @extends SceneJS.Node
 * <p>Scene node that applies a model-space translate transform to the nodes within its subgraph.</p>
 * <p><b>Example</b></p><p>A cube translated along the X axis.</b></p><pre><code>
 * var translate = new SceneJS.Translate({
 *       x: 5.0,
 *       y: 0.0,
 *       z: 0.0
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Translate
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Translate = function() {
    SceneJS.Node.apply(this, arguments);
    this._mat = null;
    this._xform = null;
    this._x = 0;
    this._y = 0;
    this._z = 1;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._utils.inherit(SceneJS.Translate, SceneJS.Node);

/**
 * Sets the translation vector
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setXYZ = function(xyz) {
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._x = x;
    this._y = y;
    this._z = z;
    this._memoLevel = 0;
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
    this._memoLevel = 0;
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
    this._memoLevel = 0;
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
    this._memoLevel = 0;
    return this;
};

/** Gets the Z component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getZ = function() {
    return this._z;
};

SceneJS.Translate.prototype._init = function(params) {
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

SceneJS.Translate.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_translationMat4v([this._x, this._y, this._z]);
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
SceneJS.translate = function() {
    var n = new SceneJS.Translate();
    SceneJS.Translate.prototype.constructor.apply(n, arguments);
    return n;
};
