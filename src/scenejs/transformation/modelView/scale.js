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
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Scale
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Scale = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scale";
    this._mat = null;
    this._xform = null;
    this._x = 0;
    this._y = 0;
    this._z = 1;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Scale, SceneJS.Node);

/**
 * Sets all scale factors.
 * @param {object} xyz The factors - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setXYZ = function(xyz) {
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._x = x;
    this._y = y;
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Returns the scale factors.
 * @returns {Object} the factors, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Scale.prototype.getXYZ = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

/** Sets the X scale factor
 *
 * @param x
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setX = function(x) {
    this._x = x;
    this._memoLevel = 0;
    return this;
};

/** Returns the X scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getX = function() {
    return this._x;
};

/** Sets the Y scale factor
 *
 * @param y
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setY = function(y) {
    this._y = y;
    this._memoLevel = 0;
    return this;
};

/** Returns the Y scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getY = function() {
    return this._y;
};

/** Sets the Z scale factor
 *
 * @param z
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setZ = function(z) {
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Gets the Z scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getZ = function() {
    return this._z;
};

SceneJS.Scale.prototype._init = function(params) {
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

SceneJS.Scale.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_scalingMat4v([this._x, this._y, this._z]);
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var instancing = SceneJS_instancingModule.instancing();
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams && !instancing
        };
        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelViewTransformModule.setTransform(superXform);
};

/** Factory function that returns a new {@link SceneJS.Scale} instance
 */
SceneJS.scale = function() {
    var n = new SceneJS.Scale();
    SceneJS.Scale.prototype.constructor.apply(n, arguments);
    return n;
};
