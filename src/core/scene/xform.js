/**
 * @class Scene graph node which defines the modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.XForm = SceneJS_NodeFactory.createNodeType("xform");

SceneJS.XForm.prototype._init = function (params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);

        this.setElements(params.elements);
    }
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

SceneJS.XForm.prototype._compile = function () {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes();
    SceneJS_modelXFormStack.pop();
};
