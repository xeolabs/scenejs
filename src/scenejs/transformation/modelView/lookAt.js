/**
 * @class A scene node that defines a viewing transform by specifing location of the eye position, the point being looked
 * at, and the direction of "up".
 * @extends SceneJS.Node
 * <p><b>Usage Example:</b></p><p>Defining perspective, specifying parameters that happen to be the default values</b></p><pre><code>
 * var l = new SceneJS.LookAt({
 *     eye : { x: 0.0, y: 10.0, z: -15 },
 *    look : { y:1.0 },
 *    up : { y: 1.0 },
 *
 * // .. Child nodes ...
 *
 * </pre></code>
 *
 * @constructor
 * Create a new SceneJS.LookAt
 * @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.LookAt = SceneJS.createNodeType("lookAt");

SceneJS.LookAt.prototype._init = function(params) {
    this._mat = null;
    this._xform = null;

    this.setEye(params.eye);
    this.setLook(params.look);
    this.setUp(params.up);
};

/** Sets the eye position.
 * Don't allow this position to be the same as the position being looked at.
 *
 * @param {Object} eye - Eg. { x: 0.0, y: 10.0, z: -15 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setEye = function(eye) {
    eye = eye || {};
    this._eyeX = (eye.x != undefined && eye.x != null) ? eye.x : 0;
    this._eyeY = (eye.y != undefined && eye.y != null) ? eye.y : 0;
    this._eyeZ = (eye.z != undefined && eye.z != null) ? eye.z : 0;
    this._setDirty();
    return this;
};

/** Sets the eye X position.
 *
 * @param {float} x Eye X position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setEyeX = function(x) {
    this._eyeX = x || 0;
    this._setDirty();
    return this;
};

/** Sets the eye Y position.
 *
 * @param {float} y Eye Y position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setEyeY = function(y) {
    this._eyeY = y || 0;
    this._setDirty();
    return this;
};

/** Sets the eye Z position.
 *
 * @param {float} z Eye Z position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setEyeZ = function(z) {
    this._eyeZ = z || 0;
    this._setDirty();
    return this;
};

/** Returns the eye position.
 *
 * @returns {Object} Eye position - Eg. { x: 0.0, y: 10.0, z: -15 }
 */
SceneJS.LookAt.prototype.getEye = function() {
    return {
        x: this._eyeX,
        y: this._eyeY,
        z: this._eyeZ
    };
};

/** Sets the point being looked at.
 * Don't allow this point to be the same as the eye position.
 *
 * @param {Object} look - Eg. { x: 0.0, y: 2.0, z: 0.0 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setLook = function(look) {
    look = look || {};
    this._lookX = (look.x != undefined && look.x != null) ? look.x : 0;
    this._lookY = (look.y != undefined && look.y != null) ? look.y : 0;
    this._lookZ = (look.z != undefined && look.z != null) ? look.z : 0;
    this._setDirty();
    return this;
};

/** Sets the look X position.
 *
 * @param {float} x Look X position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setLookX = function(x) {
    this._lookX = x || 0;
    this._setDirty();
    return this;
};

/** Sets the look Y position.
 *
 * @param {float} y Look Y position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setLookY = function(y) {
    this._lookY = y || 0;
    this._setDirty();
    return this;
};

/** Sets the look Z position.
 *
 * @param {float} z Look Z position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setLookZ = function(z) {
    this._lookZ = z || 0;
    this._setDirty();
    return this;
};

/** Returns the position being looked at.
 * @returns {Object} Point looked at - Eg. { x: 0.0, y: 2.0, z: 0.0 }
 */
SceneJS.LookAt.prototype.getLook = function() {
    return {
        x: this._lookX,
        y: this._lookY,
        z: this._lookZ
    };
};

/** Sets the "up" vector - the direction that is considered "upwards".
 *
 * @param {Object} up - Eg. { x: 0.0, y: 1.0, z: 0.0 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setUp = function(up) {
    up = up || { y: 1.0 };
    var x = (up.x != undefined && up.x != null) ? up.x : 0;
    var y = (up.y != undefined && up.y != null) ? up.y : 0;
    var z = (up.z != undefined && up.z != null) ? up.z : 0;
    if (x + y + z == 0) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidNodeConfigException(
                        "SceneJS.lookAt up vector is zero length - at least one of its x,y and z components must be non-zero"));
    }
    this._upX = x;
    this._upY = y;
    this._upZ = z;
    this._setDirty();
    return this;
};

/** Sets the up X position.
 *
 * @param {float} x Up X position
 * @returns {SceneJS.UpAt} this
 */
SceneJS.LookAt.prototype.setUpX = function(x) {
    this._upX = x || 0;
    this._setDirty();
    return this;
};

/** Sets the up Y position.
 *
 * @param {float} y Up Y position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setUpY = function(x) {
    this._upY = y || 0;
    this._setDirty();
    return this;
};

/** Sets the up Z position.
 *
 * @param {float} z Up Z position
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setUpZ = function(x) {
    this._upZ = z || 0;
    this._setDirty();
    return this;
};


/** Returns the "up" vector - the direction that is considered "upwards".
 *
 * @returns {Object} Up vector - Eg. { x: 0.0, y: 1.0, z: 0.0 }
 */
SceneJS.LookAt.prototype.getUp = function() {
    return {
        x: this._upX,
        y: this._upY,
        z: this._upZ
    };
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]}
 */
SceneJS.LookAt.prototype.getMatrix = function() {
    return (this._memoLevel > 0)
            ? this._mat.slice(0)
            : SceneJS._math_lookAtMat4c(
            this._eyeX, this._eyeY, this._eyeZ,
            this._lookX, this._lookY, this._lookZ,
            this._upX, this._upY, this._upZ);
};

SceneJS.LookAt.prototype._render = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        this._mat = SceneJS._math_lookAtMat4c(
                this._eyeX, this._eyeY, this._eyeZ,
                this._lookX, this._lookY, this._lookZ,
                this._upX, this._upY, this._upZ);
        this._memoLevel = 1;
    }
    var superXform = SceneJS._modelViewTransformModule.getTransform();
    if (this._memoLevel < 2 || (!superXform.fixed)) {
        var tempMat = SceneJS._math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            type: "lookat",
            matrix: tempMat,
            lookAt : {
                eye: { x: this._eyeX, y: this._eyeY, z: this._eyeZ },
                look: { x: this._lookX, y: this._lookY, z: this._lookZ },
                up:  { x: this._upX, y: this._upY, z: this._upZ }
            },
            fixed: origMemoLevel == 2
        };
        if (this._memoLevel == 1 && superXform.fixed && !SceneJS._instancingModule.instancing()) {   // Bump up memoization level if space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS._modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext);
    SceneJS._modelViewTransformModule.setTransform(superXform);
};
