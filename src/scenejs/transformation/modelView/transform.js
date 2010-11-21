/**
 * @class A scene node that applies a model-space transform transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube transformed along the X axis.</b></p><pre><code>
 * var transform = new SceneJS.Transform({
 *       translateXYZ: { x: 5.0, y: 0.0, z: 0.0 }
 *   },
 *
 *      new SceneJS.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Transform
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Transform = SceneJS.createNodeType("transform");

SceneJS.Transform.prototype._init = function(params) {
    this._mat = null;
    this._xform = null;
    this.setTranslateXYZ({x : params.x, y: params.y, z: params.z });
    this.setScaleXYZ({x : params.x, y: params.y, z: params.z });
    this.setRotateXYZ({x : params.x, y: params.y, z: params.z });
};

/**
 * Sets the translation vector
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setTranslateXYZ = function(xyz) {
    xyz = xyz || {};
    this._translate = {x : xyz.x || 0, y: xyz.y || 0, z: xyz.z || 0 };
    this._setDirty();
    return this;
};

/** Returns the translation vector
 * @returns {Object} the vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Transform.prototype.getTranslateXYZ = function() {
    return {
        x: this._translate.x,
        y: this._translate.y,
        z: this._translate.z
    };
};

/** Sets the X component of the translation vector
 *
 * @param x
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setTranslateX = function(x) {
    this._translate.x = x;
    this._setDirty();
    return this;
};

/** Returns the X component of the translation vector

 * @returns {float}
 */
SceneJS.Transform.prototype.getX = function() {
    return this._translate.x;
};

/** Sets the Y component of the translation vector
 *
 * @param y
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setTranslateY = function(y) {
    this._translate.y = y;
    this._setDirty();
    return this;
};

/** Returns the Y component of the translation vector

 * @returns {float}
 */
SceneJS.Transform.prototype.getTranslateY = function() {
    return this._translate.y;
};

/** Sets the Z component of the translation vector
 *
 * @param z
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setTranslateZ = function(z) {
    this._translate.z = z;
    this._setDirty();
    return this;
};

/** Gets the Z component of the translation vector

 * @returns {float}
 */
SceneJS.Transform.prototype.getTranslateZ = function() {
    return this._translate.z;
};


/**
 * Sets the scale factors
 * @param {object} xyz The factors - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setScaleXYZ = function(xyz) {
    xyz = xyz || {};
    this._scale = {x : xyz.x || 0, y: xyz.y || 0, z: xyz.z || 0 };
    this._setDirty();
    return this;
};

/** Returns the scale factors
 * @returns {Object} the factors, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Transform.prototype.getScaleXYZ = function() {
    return {
        x: this._scale.x,
        y: this._scale.y,
        z: this._scale.z
    };
};

/** Sets the X component of the scale factors
 *
 * @param x
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setScaleX = function(x) {
    this._scale.x = x;
    this._setDirty();
    return this;
};

/** Returns the X component of the scale factors

 * @returns {float}
 */
SceneJS.Transform.prototype.getX = function() {
    return this._scale.x;
};

/** Sets the Y component of the scale factors
 *
 * @param y
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setScaleY = function(y) {
    this._scale.y = y;
    this._setDirty();
    return this;
};

/** Returns the Y component of the scale factors

 * @returns {float}
 */
SceneJS.Transform.prototype.getScaleY = function() {
    return this._scale.y;
};

/** Sets the Z component of the scale factors
 *
 * @param z
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setScaleZ = function(z) {
    this._scale.z = z;
    this._setDirty();
    return this;
};

/** Gets the Z component of the scale factors

 * @returns {float}
 */
SceneJS.Transform.prototype.getScaleZ = function() {
    return this._scale.z;
};


/**
 * Sets the rotate angles
 * @param {object} xyz The angles - eg. {x: 0, y: 45, z: 0}
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setRotateXYZ = function(xyz) {
    xyz = xyz || {};
    this._rotate = {x : xyz.x || 0, y: xyz.y || 0, z: xyz.z || 0 };
    this._setDirty();
    return this;
};

/** Returns the rotate angles
 * @returns {Object} the angles, eg. {x: 0, y: 45, z: 0}
 */
SceneJS.Transform.prototype.getRotateXYZ = function() {
    return {
        x: this._rotate.x,
        y: this._rotate.y,
        z: this._rotate.z
    };
};

/** Sets the X component of the rotate angles
 *
 * @param x
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setRotateX = function(x) {
    this._rotate.x = x;
    this._setDirty();
    return this;
};

/** Returns the X component of the rotate angles

 * @returns {float}
 */
SceneJS.Transform.prototype.getX = function() {
    return this._rotate.x;
};

/** Sets the Y component of the rotate angles
 *
 * @param y
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setRotateY = function(y) {
    this._rotate.y = y;
    this._setDirty();
    return this;
};

/** Returns the Y component of the rotate angles

 * @returns {float}
 */
SceneJS.Transform.prototype.getRotateY = function() {
    return this._rotate.y;
};

/** Sets the Z component of the rotate angles
 *
 * @param z
 * @returns {SceneJS.Transform} this
 */
SceneJS.Transform.prototype.setRotateZ = function(z) {
    this._rotate.z = z;
    this._setDirty();
    return this;
};

/** Gets the Z component of the rotate angles

 * @returns {float}
 */
SceneJS.Transform.prototype.getRotateZ = function() {
    return this._rotate.z;
};

SceneJS.Transform.prototype._render = function(traversalContext) {
    var origMemoLevel = this._memoLevel;
    if (this._memoLevel == 0) {
        var buildingViewXForm = SceneJS._modelViewTransformModule.isBuildingViewTransform();

        /* Scale
         */
        this._mat = SceneJS._math_scalingMat4v([-this._scale.x, -this._scale.y, -this._scale.z]);

        /* Rotation
         */
        if (this._rotate.x + this._rotate.y + this._rotate.z > 0) {

            /* When building a view transform, apply the negated rotation angle
             * to correctly transform the SceneJS.Camera
             */

            var mat1 = SceneJS._math_rotationMat4v(buildingViewXForm ? -this._rotate.x : this._rotate.x * Math.PI / 180.0, [1, 0, 0]);
            var mat2 = SceneJS._math_rotationMat4v(buildingViewXForm ? -this._rotate.y : this._rotate.y * Math.PI / 180.0, [0, 1, 0]);
            var mat3 = SceneJS._math_rotationMat4v(buildingViewXForm ? -this._rotate.z : this._rotate.z * Math.PI / 180.0, [0, 0, 1]);

            SceneJS._math_mulMat4(mat3, SceneJS._math_mulMat4(mat2, SceneJS._math_mulMat4(mat1, this._mat)), this._mat);
        } else {
            this._mat = SceneJS._math_identityMat4();
        }

        /* Translation
         */
        if (this._translate.x + this._translate.y + this._translate.z > 0) {

            if (buildingViewXForm) {

                /* When building a view transform, apply the negated translation vector
                 * to correctly transform the SceneJS.Camera
                 */
                SceneJS._math_mulMat4(this._mat, SceneJS._math_translationMat4v([-this._translate.x, -this._translate.y, -this._translate.z]));
            } else {
                SceneJS._math_mulMat4(this._mat, SceneJS._math_translationMat4v([ this._translate.x,  this._translate.y,  this._translate.z]));
            }
        }

        this._memoLevel = 1;
    }
    var superXForm = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXForm.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();

        var tempMat = SceneJS._math_mat4(); 
        SceneJS._math_mulMat4(superXForm.matrix, this._mat, tempMat);
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
