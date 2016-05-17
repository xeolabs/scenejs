
/**
 * @class Scene graph node which defines a modelling transform matrix to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Matrix = SceneJS_NodeFactory.createNodeType("matrix");

SceneJS.Matrix.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);

        this.setElements(params.elements);

        this.xformParent = null;
        this.xformChildren = [];
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

SceneJS.Matrix.prototype._compile = function (ctx) {
    var core = this._core;
    core.numCores = 0;
    for (var i = 0, len = this.xformChildren.length; i < len; i++) {
        var child = this.xformChildren[i];
        if (!this.branchDirty && !child.dirty) {
            core.cores[core.numCores++] = child._core;
        }
    }

    for (i = core.numCores, len = core.cores.length; i < len; i++) {
        core.cores[i] = null;
    }

    SceneJS_modelXFormStack.push(core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};

SceneJS.Matrix.prototype._connect = function () {
    if (this.xformParent) {
        return;
    }

    var n = this;

    while (n.parent) {
        n = n.parent;

        if (n.xformChildren && this.xformParent !== n) {
            this.xformParent = n;
            n.xformChildren.push(this);
            break;
        }
    }
};

SceneJS.Matrix.prototype._disconnect = function () {
    if (!this.xformParent) {
        return;
    }

    var n = this;

    while (n.parent) {
        n = n.parent;

        // Still connected to xformParent
        if (this.xformParent === n) {
            return;
        }
    }

    var siblings = this.xformParent.xformChildren;
    siblings.splice(siblings.indexOf(this), 1);
    this.xformParent = null;
};
