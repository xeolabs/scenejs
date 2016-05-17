/**
 * @class Scene graph node which defines the modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.XForm = SceneJS_NodeFactory.createNodeType("xform");

SceneJS.XForm.prototype._init = function (params) {

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
SceneJS.XForm.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, XForm, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.XForm.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};


SceneJS.XForm.prototype.setElements = function (elements) {

    elements = elements || SceneJS_math_identityMat4();

    if (elements.length != 16) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.XForm elements should number 16");
    }

    var core = this._core;

    if (!core.matrix) {
        core.matrix = elements;

    } else {

        for (var i = 0; i < 16; i++) {
            core.matrix[i] = elements[i];
        }
    }

//    core.mat.set(core.matrix);
//    core.normalMat.set(
//        SceneJS_math_transposeMat4(
//            SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));


    core.setDirty();

    this._engine.display.imageDirty = true;

    return this;
};

SceneJS.XForm.prototype._compile = function (ctx) {
    var core = this._core;
    var i, len;

    core.numCores = 0;
    for (i = 0, len = this.xformChildren.length; i < len; i++) {
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

SceneJS.XForm.prototype._connect = function () {
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

SceneJS.XForm.prototype._disconnect = function () {
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
