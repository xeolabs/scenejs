(function() {

    var Matrix = SceneJS.createNodeType("xform");

    Matrix.prototype._init = function(params) {
        this._xf = {};
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setElements(params.elements);
        }
    };

    /**
     * Sets the matrix elements
     * @param {Array} elements One-dimensional array of matrix elements
     */
    Matrix.prototype.setElements = function(elements) {
        elements = elements || SceneJS_math_identityMat4();
        if (elements.length != 16) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Matrix elements should number 16");
        }
        var core = this.core;
        if (!core.matrix) {
            core.matrix = SceneJS_math_identityMat4();
        } else {
            for (var i = 0; i < 16; i++) {
                core.matrix[i] = elements[i];
            }
        }
        if (!core.matrixAsArray) {
            core.matrixAsArray = new Float32Array(elements);
            core.normalMatrixAsArray = new Float32Array(
                    SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(elements, SceneJS_math_mat4())));
        } else {
            core.matrixAsArray.set(elements);
            core.normalMatrixAsArray.set(
                    SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(elements, SceneJS_math_mat4())));
        }
        return this;
    };

    Matrix.prototype._compile = function() {
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this.core);
        this._compileNodes();
        SceneJS_modelTransformModule.popTransform();
    };

})();