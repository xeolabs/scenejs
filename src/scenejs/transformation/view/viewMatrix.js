/**
 * @class A scene node that applies a model-space transform to the nodes within its subgraph.
 * @extends SceneJS.Node

 * <p><b>Example</b></p><p>A cube translated along the X, Y and Z axis.</b></p><pre><code>
 * var mat = new SceneJS.ViewMatrix({
 *       elements : [
 *              1, 0, 0, 10,
 *              0, 1, 0, 5,
 *              0, 0, 1, 3,
 *              0, 0, 0, 1
 *          ]
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.ViewMatrix
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.ViewMatrix = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "viewMatrix";
    this._mat = SceneJS_math_identityMat4();
    this._xform = null;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.ViewMatrix, SceneJS.Node);

/**
 * Sets the matrix elements
 * @param {Array} elements One-dimensional array of matrix elements
 * @returns {SceneJS.ViewMatrix} this
 */
SceneJS.ViewMatrix.prototype.setElements = function(elements) {
    if (!elements) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.ViewMatrix elements undefined"));
    }
    if (elements.length != 16) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.ViewMatrix elements should number 16"));
    }
    for (var i = 0; i < 16; i++) {
        this._mat[i] = elements[i];
    }
    this._memoLevel = 0;
    return this;
};

/** Returns the matrix elements
 * @returns {Object} One-dimensional array of matrix elements
 */
SceneJS.ViewMatrix.prototype.getElements = function() {
    var elements = new Array(16);
    for (var i = 0; i < 16; i++) {
        elements[i] = this._mat[i];
    }
    return elements;
};

SceneJS.ViewMatrix.prototype._init = function(params) {
    this.setElements(params.elements);
};

SceneJS.ViewMatrix.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    var superXform = SceneJS_viewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed && !SceneJS_instancingModule.instancing()) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.viewMatrix = function() {
    var n = new SceneJS.ViewMatrix();
    SceneJS.ViewMatrix.prototype.constructor.apply(n, arguments);
    return n;
};
