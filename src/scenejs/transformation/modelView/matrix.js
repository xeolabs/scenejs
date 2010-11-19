/**
 * @class A scene node that defines a 4x4 matrix to transform the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube translated along the X, Y and Z axis.</b></p><pre><code>
 * var mat = new SceneJS.Matrix({
 *       elements : [
 *              1, 0, 0, 10,
 *              0, 1, 0, 5,
 *              0, 0, 1, 3,
 *              0, 0, 0, 1
 *          ]
 *   },
 *
 *      new SceneJS.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Matrix
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Matrix = SceneJS.createNodeType("matrix");

SceneJS.Matrix.prototype._init = function(params) {
    this._xform = null;
    this._mat = SceneJS._math_identityMat4();
    this.setElements(params.elements);
};

/**
 * Sets the matrix elements
 * @param {Array} elements One-dimensional array of matrix elements
 * @returns {SceneJS.Matrix} this
 */
SceneJS.Matrix.prototype.setElements = function(elements) {
    elements = elements || SceneJS._math_identityMat4();
    if (!elements) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException("SceneJS.Matrix elements undefined"));
    }
    if (elements.length != 16) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException("SceneJS.Matrix elements should number 16"));
    }
    for (var i = 0; i < 16; i++) {
        this._mat[i] = elements[i];
    }
    this._setDirty();
    return this;
};

/** Returns the matrix elements
 * @deprecated
 * @returns {Object} One-dimensional array of matrix elements
 */
SceneJS.Matrix.prototype.getElements = function() {
    var elements = new Array(16);
    for (var i = 0; i < 16; i++) {
        elements[i] = this._mat[i];
    }
    return elements;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]} The matrix elements
 */
SceneJS.Matrix.prototype.getMatrix = function() {
    return this._mat.slice(0);
};


SceneJS.Matrix.prototype._render = function(traversalContext) {
    var origMemoLevel = this._memoLevel;

    if (this._memoLevel == 0) {
            this._memoLevel = 1;
    }
    var superXform = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXform.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();

        /* When building a view transform, apply the inverse of the matrix
         * to correctly transform the SceneJS.Camera
         */
        var mat = SceneJS._math_mat4();
        mat = SceneJS._modelViewTransformModule.isBuildingViewTransform()
                ? SceneJS._math_inverseMat4(this._mat, mat)
                : this._mat;

        var tempMat = SceneJS._math_mat4(); 
        SceneJS._math_mulMat4(superXform.matrix, mat, tempMat);

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
