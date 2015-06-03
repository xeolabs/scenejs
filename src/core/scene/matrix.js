
/**
 * @class Scene graph node which defines a modelling transform matrix to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Matrix = SceneJS_NodeFactory.createNodeType("matrix");

SceneJS.Matrix.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);

        this.setElements(params.elements);
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.Matrix.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, matrix, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.Matrix.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};

/**
 * Sets the matrix elements
 * @type {Function}
 */
SceneJS.Matrix.prototype.setMatrix = function(elements) {

    elements = elements || SceneJS_math_identityMat4();

    if (elements.length != 16) {
        throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "SceneJS.Matrix elements should number 16");
    }

    var core = this._core;

    if (!core.matrix) {
        core.matrix = elements;

    } else {

        for (var i = 0; i < 16; i++) {
            core.matrix[i] = elements[i];
        }
    }

    core.setDirty();

    this._engine.display.imageDirty = true;

    return this;
};

/**
 * Sets the matrix elements
 * @deprecated
 * @type {Function}
 */
SceneJS.Matrix.prototype.setElements = SceneJS.Matrix.prototype.setMatrix;

SceneJS.Matrix.prototype._compile = function(ctx) {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};
