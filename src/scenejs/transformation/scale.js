(function () {

    var Scale = SceneJS.createNodeType("scale");

    Scale.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setMultOrder(params.multOrder);
            this.setXYZ({x : params.x, y: params.y, z: params.z });
        }
        this._mat = null;
        this._xf = {};
    };

    Scale.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal scale multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.core.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
    };

    Scale.prototype.setXYZ = function(xyz) {
        xyz = xyz || {};
        this.core.x = (xyz.x != undefined) ? xyz.x : 1;
        this.core.y = (xyz.y != undefined) ? xyz.y : 1;
        this.core.z = (xyz.z != undefined) ? xyz.z : 1;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getXYZ = function() {
        return {
            x: this.core.x,
            y: this.core.y,
            z: this.core.z
        };
    };

    Scale.prototype.setX = function(x) {
        this.core.x = (x != undefined && x != null) ? x : 1.0;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getX = function() {
        return this.core.x;
    };

    Scale.prototype.setY = function(y) {
        this.core.y = (y != undefined && y != null) ? y : 1.0;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getY = function() {
        return this.core.y;
    };

    Scale.prototype.setZ = function(z) {
        this.core.z = (z != undefined && z != null) ? z : 1.0;
        this._resetCompilationMemos();
        return this;
    };

    Scale.prototype.getZ = function() {
        return this.core.z;
    };

    Scale.prototype.incX = function(x) {
        this.core.x += x;
        this._compileMemoLevel = 0;
    };

    Scale.prototype.incY = function(y) {
        this.core.y += y;
    };

    Scale.prototype.incZ = function(z) {
        this.core.z += z;
        this._compileMemoLevel = 0;
    };

    Scale.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0) ? this._mat.slice(0) : SceneJS_math_scalingMat4v([this.core.x, this.core.y, this.core.z]);
    };

    Scale.prototype.getAttributes = function() {
        return {
            x: this.core.x,
            y: this.core.y,
            z: this.core.z
        };
    };

    Scale.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Scale.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._compileMemoLevel = 1;
            this._mat = SceneJS_math_scalingMat4v([this.core.x, this.core.y, this.core.z]);
        }
        var superXform = SceneJS_modelTransformModule.transform;
        if (origMemoLevel < 2 || (!superXform.fixed)) {
            var tempMat = SceneJS_math_mat4();

            if (this._postMult) {
                SceneJS_math_mulMat4(superXform.matrix, this._mat, tempMat);
            } else {
                SceneJS_math_mulMat4(this._mat, superXform.matrix, tempMat);
            }

            this._xf.localMatrix = this._mat;
            this._xf.matrix = tempMat;
            this._xf.fixed = origMemoLevel == 2;

            if (this._compileMemoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this._xf);
    };

    Scale.prototype._postCompile = function(traversalContext) {
        SceneJS_modelTransformModule.popTransform();
    };

})();