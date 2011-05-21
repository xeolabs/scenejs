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
 */
SceneJS.LookAt.prototype.setEye = function(eye) {
    eye = eye || {};
    this._eyeX = (eye.x != undefined && eye.x != null) ? eye.x : 0;
    this._eyeY = (eye.y != undefined && eye.y != null) ? eye.y : 0;
    this._eyeZ = (eye.z != undefined && eye.z != null) ? eye.z : 0;
    this._memoLevel = 0;
};

/** Sets the eye X position.
 *
 * @param {float} x Eye X position
 */
SceneJS.LookAt.prototype.setEyeX = function(x) {
    this._eyeX = x || 0;
    this._memoLevel = 0;
};

/** Sets the eye Y position.
 *
 * @param {float} y Eye Y position
 */
SceneJS.LookAt.prototype.setEyeY = function(y) {
    this._eyeY = y || 0;
    this._memoLevel = 0;
};

/** Moves the eye position.
 * Don't allow this position to be the same as the position being looked at.
 *
 * @param {Object} eye increment - Eg. { x: 0.0, y: 10.0, z: -15 }
 */
SceneJS.LookAt.prototype.incEye = function(eye) {
    eye = eye || {};
    this._eyeX += (eye.x != undefined && eye.x != null) ? eye.x : 0;
    this._eyeY += (eye.y != undefined && eye.y != null) ? eye.y : 0;
    this._eyeZ += (eye.z != undefined && eye.z != null) ? eye.z : 0;
    this._memoLevel = 0;
};

/** Increments the eye X position
 *
 * @param x
 */
SceneJS.LookAt.prototype.incEyeX = function(x) {
    this._eyeX += x;
    this._memoLevel = 0;
};

/** Increments the eye Y position
 *
 * @param y
 */
SceneJS.LookAt.prototype.incEyeY = function(y) {
    this._eyeY += y;
    this._memoLevel = 0;
};

/** Increments the eye Z position
 *
 * @param z
 */
SceneJS.LookAt.prototype.incEyeZ = function(z) {
    this._eyeZ += z;
    this._memoLevel = 0;
};

/** Sets the eye Z position.
 *
 * @param {float} z Eye Z position
 */
SceneJS.LookAt.prototype.setEyeZ = function(z) {
    this._eyeZ = z || 0;
    this._memoLevel = 0;
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
 */
SceneJS.LookAt.prototype.setLook = function(look) {
    look = look || {};
    this._lookX = (look.x != undefined && look.x != null) ? look.x : 0;
    this._lookY = (look.y != undefined && look.y != null) ? look.y : 0;
    this._lookZ = (look.z != undefined && look.z != null) ? look.z : 0;
    this._memoLevel = 0;
};

/** Sets the look X position.
 *
 * @param {float} x Look X position
 */
SceneJS.LookAt.prototype.setLookX = function(x) {
    this._lookX = x || 0;
    this._memoLevel = 0;
};

/** Sets the look Y position.
 *
 * @param {float} y Look Y position
 */
SceneJS.LookAt.prototype.setLookY = function(y) {
    this._lookY = y || 0;
    this._memoLevel = 0;
};

/** Sets the look Z position.
 *
 * @param {float} z Look Z position
 */
SceneJS.LookAt.prototype.setLookZ = function(z) {
    this._lookZ = z || 0;
    this._memoLevel = 0;
};

/** Moves the look position.
 * Don't allow this position to be the same as the position being looked at.
 *
 * @param {Object} look increment - Eg. { x: 0.0, y: 10.0, z: -15 }
 */
SceneJS.LookAt.prototype.incLook = function(look) {
    look = look || {};
    this._lookX += (look.x != undefined && look.x != null) ? look.x : 0;
    this._lookY += (look.y != undefined && look.y != null) ? look.y : 0;
    this._lookZ += (look.z != undefined && look.z != null) ? look.z : 0;
    this._memoLevel = 0;
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
 */
SceneJS.LookAt.prototype.setUp = function(up) {
    up = up || { y: 1.0 };
    var x = (up.x != undefined && up.x != null) ? up.x : 0;
    var y = (up.y != undefined && up.y != null) ? up.y : 0;
    var z = (up.z != undefined && up.z != null) ? up.z : 0;
    if (x + y + z == 0) {
        throw SceneJS_errorModule.fatalError(
                 SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "SceneJS.lookAt up vector is zero length - at least one of its x,y and z components must be non-zero");
    }
    this._upX = x;
    this._upY = y;
    this._upZ = z;
    this._memoLevel = 0;
};

/** Sets the up X position.
 *
 * @param {float} x Up X position
 */
SceneJS.LookAt.prototype.setUpX = function(x) {
    this._upX = x || 0;
    this._memoLevel = 0;
};

/** Sets the up Y position.
 *
 * @param {float} y Up Y position
 */
SceneJS.LookAt.prototype.setUpY = function(x) {
    this._upY = y || 0;
    this._memoLevel = 0;
};

/** Sets the up Z position.
 *
 * @param {float} z Up Z position
 */
SceneJS.LookAt.prototype.setUpZ = function(x) {
    this._upZ = z || 0;
    this._memoLevel = 0;
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
 * Moves the up vector.
 *
 * @param {Object} up increment - Eg. { x: 0.0, y: 10.0, z: -15 }
 */
SceneJS.LookAt.prototype.incUp = function(up) {
    up = up || {};
    this._upX += (up.x != undefined && up.x != null) ? up.x : 0;
    this._upY += (up.y != undefined && up.y != null) ? up.y : 0;
    this._upZ += (up.z != undefined && up.z != null) ? up.z : 0;
    this._memoLevel = 0;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]}
 */
SceneJS.LookAt.prototype.getMatrix = function() {
    return (this._memoLevel > 0)
            ? this._mat.slice(0)
            : SceneJS_math_lookAtMat4c(
            this._eyeX, this._eyeY, this._eyeZ,
            this._lookX, this._lookY, this._lookZ,
            this._upX, this._upY, this._upZ);
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.LookAt.prototype.getAttributes = function() {
    return {
        look: {
            x: this._lookX,
            y: this._lookY,
            z: this._lookZ
        },
        eye: {
            x: this._eyeX,
            y: this._eyeY,
            z: this._eyeZ
        },
        up: {
            x: this._upX,
            y: this._upY,
            z: this._upZ
        }
    };
};

// @private
SceneJS.LookAt.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.LookAt.prototype._preCompile = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        this._mat = SceneJS_math_lookAtMat4c(
                this._eyeX, this._eyeY, this._eyeZ,
                this._lookX, this._lookY, this._lookZ,
                this._upX, this._upY, this._upZ);
        this._memoLevel = 1;
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (this._memoLevel < 2 || (!superXform.fixed)) {
        var tempMat = SceneJS_math_mat4();
        SceneJS_math_mulMat4(superXform.matrix, this._mat, tempMat);
        this._xform = {
            type: "lookat",
            matrix: tempMat,
            lookAt : {
                eye: [this._eyeX, this._eyeY, this._eyeZ ],
                look: [this._lookX, this._lookY, this._lookZ ],
                up:  [this._upX, this._upY, this._upZ ]
            },
            fixed: origMemoLevel == 2
        };
        if (this._memoLevel == 1 && superXform.fixed && !SceneJS_instancingModule.instancing()) {   // Bump up memoization level if space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.pushTransform(this._attr.id, this._xform);
};

// @private
SceneJS.LookAt.prototype._postCompile = function(traversalContext) {
    SceneJS_modelViewTransformModule.popTransform();
};
