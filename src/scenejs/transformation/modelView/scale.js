(function () {

    var Scale = SceneJS.createNodeType("scale");

    Scale.prototype._init = function(params) {
        this._mat = null;
        this._xform = null;
        this.setXYZ({x : params.x, y: params.y, z: params.z });
    };

    Scale.prototype.setXYZ = function(xyz) {
        xyz = xyz || {};
        this.attr.x = (xyz.x != undefined) ? xyz.x : 1;
        this.attr.y = (xyz.y != undefined) ? xyz.y : 1;
        this.attr.z = (xyz.z != undefined) ? xyz.z : 1;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getXYZ = function() {
        return {
            x: this.attr.x,
            y: this.attr.y,
            z: this.attr.z
        };
    };

    Scale.prototype.setX = function(x) {
        this.attr.x = (x != undefined && x != null) ? x : 1.0;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getX = function() {
        return this.attr.x;
    };

    Scale.prototype.setY = function(y) {
        this.attr.y = (y != undefined && y != null) ? y : 1.0;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getY = function() {
        return this.attr.y;
    };

    Scale.prototype.setZ = function(z) {
        this.attr.z = (z != undefined && z != null) ? z : 1.0;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getZ = function() {
        return this.attr.z;
    };

    Scale.prototype.incX = function(x) {
        this.attr.x += x;
        this._compileMemoLevel = 0;
    };

    Scale.prototype.incY = function(y) {
        this.attr.y += y;
    };

    Scale.prototype.incZ = function(z) {
        this.attr.z += z;
        this._compileMemoLevel = 0;
    };

    Scale.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0) ? this._mat.slice(0) : SceneJS_math_scalingMat4v([this.attr.x, this.attr.y, this.attr.z]);
    };

    Scale.prototype.getAttributes = function() {
        return {
            x: this.attr.x,
            y: this.attr.y,
            z: this.attr.z
        };
    };

    Scale.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Scale.prototype._preCompile = function(traversalContext) {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._compileMemoLevel = 1;
            this._mat = SceneJS_math_scalingMat4v([this.attr.x, this.attr.y, this.attr.z]);
        }
        var superXform = SceneJS_modelViewTransformModule.getTransform();
        if (origMemoLevel < 2 || (!superXform.fixed)) {
            var instancing = SceneJS_instancingModule.instancing();

            var tempMat = SceneJS_math_mat4();
            SceneJS_math_mulMat4(superXform.matrix, this._mat, tempMat);
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

    Scale.prototype._postCompile = function(traversalContext) {
        SceneJS_modelViewTransformModule.popTransform();
    };

})();