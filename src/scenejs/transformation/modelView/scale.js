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
    this._x = (xyz.x != undefined) ? xyz.x : 0;
    this._y = (xyz.y != undefined) ? xyz.y : 0;
    this._z = (xyz.z != undefined) ? xyz.z : 0;
    this._setDirty();
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
    this._x = (x != undefined && x != null) ? x : 1.0;
    this._setDirty();
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
    this._y = (y != undefined && y != null) ? y : 1.0;
    this._setDirty();
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
    this._z = (z != undefined && z != null) ? z : 1.0;
    this._setDirty();
    return this;
};

/** Gets the Z scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getZ = function() {
    return this._z;
};

SceneJS.Scale.prototype._render = function(traversalContext) {

    var origMemoLevel = this._memoLevel;

    if (this._memoLevel == 0) {       
            this._memoLevel = 1;
        this._mat = SceneJS._math_scalingMat4v([this._x, this._y, this._z]);
    }
    var superXform = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXform.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();

        var tempMat = SceneJS._math_mulMat4(superXform.matrix, this._mat);
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
