(function () {

    var Inverse = SceneJS.createNodeType("inverse");

    Inverse.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Inverse.prototype._preCompile = function(traversalContext) {
        var origMemoLevel = this._compileMemoLevel;

        if (this._compileMemoLevel == 0) {
            this._compileMemoLevel = 1; // For consistency with other transform nodes
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

            if (this._compileMemoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelViewTransformModule.pushTransform(this.attr.id, this._xform);
    };

    Inverse.prototype._postCompile = function(traversalContext) {
        SceneJS_modelViewTransformModule.popTransform();
    };


})();