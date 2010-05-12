/**
 * @class A scene node that defines a perspective projection in terms of a frustum-shaped view volume.
 *
 * <p>This node does the same thing as {@link SceneJS.Projection} , which implicitly specifies the frustum.
 * This node provides you with the ability to explicitly set the frustum, which can be useful if you want it to be
 * asymmetrical.</p>
 *
 * <p><b>Example:</b></p><p>Defining perspective projection, specifying parameters that happen to be the default values.
 * The left and right parameters specify the x-coordinate clipping planes, bottom and top specify the y-coordinate
 * clipping planes, and near and far specify the distance to the z-coordinate clipping planes.</p><pre><code>
 * var p = new SceneJS.Frustum({
 *          left   :   -0.02,
 *          bottom :   -0.02,
 *          near   :    0.1,
 *          right  :    0.02,
 *          top    :    0.02,
 *          far    : 1000.0
 *    },
 *
 *    // ... child nodes
 * )
 * </pre></code>
 *
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Frustum
 * @param {Object} cfg Config object or function, followed by zero or more child nodes
 */
SceneJS.Frustum = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "frustum";
    this._left = -1.0;
    this._right = 1.0;
    this._bottom = -1.0;
    this._top = 1.0;
    this._near = 0.1;
    this._far = 1000.0;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Frustum, SceneJS.Node);

/**
 * Sets the minimum X extent
 *
 * @function {SceneJS.Frustum} setLeft
 * @param {float} left Minimum X extent
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setLeft = function(left) {
    this._left = left;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum X extent
 *
 * @function {float} getLeft
 * @returns {float} Minimum X extent
 */
SceneJS.Frustum.prototype.getLeft = function() {
    return this._left;
};

/**
 * Sets the minimum Y extent
 *
 * @function  {SceneJS.Frustum} setBottom
 * @param {float} bottom Minimum Y extent
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setBottom = function(bottom) {
    this._bottom = bottom;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum Y extent
 * @function {float} getBottom
 * @returns {float} Minimum Y extent
 */
SceneJS.Frustum.prototype.getBottom = function() {
    return this._bottom;
};

/**
 * Sets the minimum Z extent
 *
 * @function {SceneJS.Frustum} setNear
 * @param {float} near Minimum Z extent
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setNear = function(near) {
    this._near = near;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum Z extent
 * @function {float} getNear
 * @returns {float} Minimum Z extent
 */
SceneJS.Frustum.prototype.getNear = function() {
    return this._near;
};

/**
 * Sets the maximum X extent
 *
 * @function  {SceneJS.Frustum} setRight
 * @param {float} right Maximum X extent
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setRight = function(right) {
    this._right = right;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum X extent
 * @function  {SceneJS.Frustum} setRight
 * @returns {float} Maximum X extent
 */
SceneJS.Frustum.prototype.getRight = function() {
    return this._right;
};

/**
 * Sets the maximum Y extent
 *
 * @function {SceneJS.Frustum} setTop
 * @param {float} top Maximum Y extent
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setTop = function(top) {
    this._top = top;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum Y extent
 * @function {float} getTop
 * @return {float} Maximum Y extent
 */
SceneJS.Frustum.prototype.getTop = function() {
    return this._top;
};

/**
 * Sets the maximum Z extent
 *
 * @function {SceneJS.Frustum} setFar
 * @param {float} far Maximum Z extent
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setFar = function(far) {
    this._far = far;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum Z extent
 * @function {float} getFar
 * @returns {float} Maximum Z extent
 */
SceneJS.Frustum.prototype.getFar = function() {
    return this._far;
};

/**
 * Sets all extents
 * @function {SceneJS.Frustum} setVolume
 * @param {Object} volume All extents, Eg. { left: -1.0, bottom: -1.0, near: -1.0, right: 1.0, top: 1.0, far: 1000.0}
 * @returns {SceneJS.Frustum} this
 */
SceneJS.Frustum.prototype.setVolume = function(volume) {
    this._left = volume.left || 0;
    this._bottom = volume.bottom || 0;
    this._near = volume.near || 0;
    this._right = volume.right || 0;
    this._top = volume.top || 0;
    this._far = volume.far || 0;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets all extents
 * @function {Object} getVolume
 * @returns {Object} All extents, Eg. { left: -1.0, bottom: -1.0, near: -1.0, right: 1.0, top: 1.0, far: 1000.0}
 */
SceneJS.Frustum.prototype.getVolume = function() {
    return {
        left: this._left,
        bottom: this._bottom,
        near: this._near,
        right: this._right,
        top: this._top,
        far: this._far
    };
};

// @private
SceneJS.Frustum.prototype._init = function(params) {
    this._left = params.left || -1.0;
    this._bottom = params.bottom || -1.0;
    this._near = params.near || 0.1;
    this._right = params.right || 1.00;
    this._top = params.top || 1.0;
    this._far = params.far || 1000.0;
};

// Override
SceneJS.Frustum.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        var tempMat = SceneJS_math_frustumMatrix4(
                this._left,
                this._right,
                this._bottom,
                this._top,
                this._near,
                this._far);               
        this._transform = {
            type: "frustum",
            matrix:tempMat
        };
    }
    var prevTransform = SceneJS_projectionModule.getTransform();
    SceneJS_projectionModule.setTransform(this._transform);
    this._renderNodes(traversalContext, data);
    SceneJS_projectionModule.setTransform(prevTransform);
};


/** Returns a new {@link SceneJS.Frustum} instance
 * @param {Arguments} args Variable arguments that are passed to the {@link SceneJS.Frustum} constructor
 * @returns {SceneJS.Frustum}
 */
SceneJS.frustum = function() {
    var n = new SceneJS.Frustum();
    SceneJS.Frustum.prototype.constructor.apply(n, arguments);
    return n;
};
