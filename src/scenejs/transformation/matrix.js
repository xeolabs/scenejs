(function() {

    var Matrix = SceneJS.createNodeType("matrix");

    Matrix.prototype._init = function(params) {
        this._xf = {};
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setMultOrder(params.multOrder);
            this.setElements(params.elements);
        }
    };

    Matrix.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal matrix multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.attr.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
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
        if (!this.core.mat) {
            this.core.mat = SceneJS_math_identityMat4();
        } else {
            for (var i = 0; i < 16; i++) {
                this.core.mat[i] = elements[i];
            }
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
            elements[i] = this.core.mat[i];
        }
        return elements;
    };

    /**
     * Returns a copy of the matrix as a 1D array of 16 elements
     * @returns {Number[16]} The matrix elements
     */
    Matrix.prototype.getMatrix = function() {
        return this.core.mat.slice(0);
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
        var superXform = SceneJS_modelTransformModule.transform;
        if (origMemoLevel < 2 || (!superXform.fixed)) {
            var instancing = SceneJS_instancingModule.instancing();

            /* When building a view transform, apply the inverse of the matrix
             * to correctly transform the SceneJS.Camera
             */
            var tempMat = SceneJS_math_mat4();

            if (this._postMult) {
                SceneJS_math_mulMat4(superXform.matrix, this.core.mat, tempMat);
            } else {
                SceneJS_math_mulMat4(this.core.mat, superXform.matrix, tempMat);
            }

            this._xf.localMatrix = this.core.mat;
            this._xf.matrix = tempMat;
            this._xf.fixed = origMemoLevel == 2;

            if (this._compileMemoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this._xf);
    };

    Matrix.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };
})();