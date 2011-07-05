(function() {
    
    var Matrix = SceneJS.createNodeType("matrix");

    Matrix.prototype._init = function(params) {
        this._xform = null;
        this._mat = SceneJS_math_identityMat4();
        this.setElements(params.elements);
    };

    /**
     * Sets the matrix elements
     * @param {Array} elements One-dimensional array of matrix elements
     * @returns {Matrix} this
     */
    Matrix.prototype.setElements = function(elements) {
        elements = elements || SceneJS_math_identityMat4();
        if (!elements) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Matrix elements undefined");
        }
        if (elements.length != 16) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Matrix elements should number 16");
        }
        for (var i = 0; i < 16; i++) {
            this._mat[i] = elements[i];
        }
        this._resetCompilationMemos();
        return this;
    };

    /** Returns the matrix elements
     * @returns {Object} One-dimensional array of matrix elements
     */
    Matrix.prototype.getElements = function() {
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
    Matrix.prototype.getMatrix = function() {
        return this._mat.slice(0);
    };

    Matrix.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Matrix.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;

        if (this._compileMemoLevel == 0) {
            this._compileMemoLevel = 1;
        }
        var superXform = SceneJS_modelTransformModule.getTransform();
        if (origMemoLevel < 2 || (!superXform.fixed)) {
            var instancing = SceneJS_instancingModule.instancing();

            /* When building a view transform, apply the inverse of the matrix
             * to correctly transform the SceneJS.Camera
             */
            var mat = SceneJS_math_mat4();
            mat = this._mat;
            var tempMat = SceneJS_math_mat4();
            SceneJS_math_mulMat4(superXform.matrix, mat, tempMat);
            this._xform = {
                localMatrix: this._mat,
                matrix: tempMat,
                fixed: origMemoLevel == 2
            };

            if (this._compileMemoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this._xform);
    };

    Matrix.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };
})();