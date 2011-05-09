/**
 * @class A scene node that inverts the transformations (IE. the model/view matrix) defined by the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>Inverting the transformation defined by a {@link SceneJS.Matrix) child node:</b></p><pre><code>
 * var inverse = new SceneJS.Inverse(
 *     new SceneJS.Matrix({
 *           elements : [
 *                  1, 0, 0, 10,
 *                  0, 1, 0, 5,
 *                  0, 0, 1, 3,
 *                  0, 0, 0, 1
 *              ]
 *        })
 *   })
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Inverse
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Inverse = SceneJS.createNodeType("inverse");

// @private
SceneJS.Inverse.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Inverse.prototype._preCompile = function(traversalContext) {
    var origMemoLevel = this._memoLevel;

    if (this._memoLevel == 0) {
        this._memoLevel = 1; // For consistency with other transform nodes
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXform.fixed)) {
        var instancing = SceneJS_instancingModule.instancing();
        var tempMat = SceneJS_math_mat4();
        SceneJS_math_inverseMat4(superXform.matrix, this._mat, tempMat);

        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: origMemoLevel == 2
        };

        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.pushTransform(this._attr.id, this._xform);
};

// @private
SceneJS.Inverse.prototype._postCompile = function(traversalContext) {
    SceneJS_modelViewTransformModule.popTransform();
};
