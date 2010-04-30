/**
 @class SceneJS.Perspective
 @extends SceneJS.Node

 <p>Scene node that defines a perspective transformation for the nodes within its subgraph.</p>

 <p><b>Example:</b></p><p>Defining perspective, specifying parameters that happen to be the default values</b></p><pre><code>
 var p = new SceneJS.Perspective({
 fovy : 55.0,
 aspect : 1.0,
 near : 0.10,
 far : 5000.0 },

 // ... child nodes
 )
 </pre></code>

 @constructor
 Create a new SceneJS.Perspective
 @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Perspective = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "perspective";
    this._fovy = 45.0;
    this._aspect = 1.0;
    this._near = 0.1;
    this._far = 1.0;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._utils.inherit(SceneJS.Perspective, SceneJS.Node);

/** Sets the field-of-view angle in degrees
 *
 * @param {float} fovy
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setFovY = function(fovy) {
    this._fovy = fovy;
    this._memoLevel = 0;
};

/** Returns the field-of-view angle in degrees
 * @returns {float} field-of-view
 */
SceneJS.Perspective.prototype.getFovyY = function() {
    return this._fovy;
};

/** Sets the height-width aspect ratio
 *
 * @param {float} aspect
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setAspect = function(aspect) {
    this._aspect = aspect;
    this._memoLevel = 0;
};

/** Returns the height-width aspect ratio
 * @returns {float} aspect ratio
 */
SceneJS.Perspective.prototype.getAspect = function() {
    return this._aspect;
};

/** Sets the distance of the near clipping plane on the Z-axis
 *
 * @param {float} near
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setNear = function(near) {
    this._near = near;
    this._memoLevel = 0;
};

/** Returns the distance of the near clipping plane on the Z-axis
 *
 * @returns {float} near
 */
SceneJS.Perspective.prototype.getNear = function() {
    return this._near;
};

/** Sets the distance of the far clipping plane on the Z-axis
 *
 * @param {float} far
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setFar = function(far) {
    this._far = far;
    this._memoLevel = 0;
};

/** Returns the distance of the far clipping plane on the Z-axis
 *
 * @returns {float} far
 */
SceneJS.Perspective.prototype.getFar = function() {
    return this._far;
};

SceneJS.Perspective.prototype._init = function(params) {
    if (params.fovy != undefined) {
        this.setFovY(params.fovy);
    }
    if (params.aspect != undefined) {
        this.setAspect(params.aspect);
    }
    if (params.near != undefined) {
        this.setNear(params.near);
    }
    if (params.far != undefined) {
        this.setFar(params.far);
    }
};

// Override
SceneJS.Perspective.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        var tempMat = SceneJS_math_perspectiveMatrix4(
                this._fovy * Math.PI / 180.0,
                this._aspect,
                this._near,
                this._far);
        this._transform = {
            type: "perspective",
            matrix:tempMat
        };
    }
    var prevTransform = SceneJS_projectionModule.getTransform();
    SceneJS_projectionModule.setTransform(this._transform);
    this._renderNodes(traversalContext, data);
    SceneJS_projectionModule.setTransform(prevTransform);
};


/** Function wrapper to support functional scene definition
 */
SceneJS.perspective = function() {
    var n = new SceneJS.Perspective();
    SceneJS.Perspective.prototype.constructor.apply(n, arguments);
    return n;
};
