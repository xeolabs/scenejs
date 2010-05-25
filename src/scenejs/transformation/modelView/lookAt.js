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
SceneJS.LookAt = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "lookat";
    this._mat = null;
    this._xform = null;

    this._eyeX = 0;
    this._eyeY = 0;
    this._eyeZ = 1;

    this._lookX = 0;
    this._lookY = 0;
    this._lookZ = 0;

    this._upX = 0;
    this._upY = 1;
    this._upZ = 0;

    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.LookAt, SceneJS.Node);

/** Sets the eye position.
 * Don't allow this position to be the same as the position being looked at.
 *
 * @param {Object} eye - Eg. { x: 0.0, y: 10.0, z: -15 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setEye = function(eye) {
    this._eyeX = eye.x || 0;
    this._eyeY = eye.y || 0;
    this._eyeZ = eye.z || 1;
    this._memoLevel = 0;
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
    this._lookX = look.x || 0;
    this._lookY = look.y || 0;
    this._lookZ = look.z || 0;
    this._memoLevel = 0;
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
    var x = up.x || 0;
    var y = up.y || 0;
    var z = up.z || 0;
    if (x + y + z == 0) {
        throw SceneJS_errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException(
                        "SceneJS.lookAt up vector is zero length - at least one of its x,y and z components must be non-zero"));
    }
    this._upX = x;
    this._upY = y;
    this._upZ = z;
    this._memoLevel = 0;
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

SceneJS.LookAt.prototype._init = function(params) {
    if (params.eye) {
        this.setEye(params.eye);
    }
    if (params.look) {
        this.setLook(params.look);
    }
    if (params.up) {
        this.setUp(params.up);
    }
};

SceneJS.LookAt.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_lookAtMat4c(
                this._eyeX, this._eyeY, this._eyeZ,
                this._lookX, this._lookY, this._lookZ,
                this._upX, this._upY, this._upZ);
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            type: "lookat",
            matrix: tempMat,
            lookAt : {
                eye: { x: this._eyeX, y: this._eyeY, z: this._eyeZ },
                look: { x: this._lookX, y: this._lookY, z: this._lookZ },
                up:  { x: this._upX, y: this._upY, z: this._upZ }
            },
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed && !SceneJS_instancingModule.instancing()) {   // Bump up memoization level if space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelViewTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.lookAt = function() {
    var n = new SceneJS.LookAt();
    SceneJS.LookAt.prototype.constructor.apply(n, arguments);
    return n;
};