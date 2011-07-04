(function () {

    var Translate = SceneJS.createNodeType("translate");

    Translate.prototype._init = function(params) {
        this._mat = null;
        this._xform = null;
        this.setXyz({x : params.x, y: params.y, z: params.z });
    };

    Translate.prototype.setXyz = function(xyz) {
        xyz = xyz || {};
        var x = xyz.x || 0;
        var y = xyz.y || 0;
        var z = xyz.z || 0;
        this.attr.x = x;
        this.attr.y = y;
        this.attr.z = z;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getXyz = function() {
        return {
            x: this.attr.x,
            y: this.attr.y,
            z: this.attr.z
        };
    };

    Translate.prototype.setX = function(x) {
        this.attr.x = x;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getX = function() {
        return this.attr.x;
    };

    Translate.prototype.setY = function(y) {
        this.attr.y = y;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getY = function() {
        return this.attr.y;
    };

    Translate.prototype.setZ = function(z) {
        this.attr.z = z;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getZ = function() {
        return this.attr.z;
    };

    Translate.prototype.incX = function(x) {
        this.attr.x += x;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.incY = function(y) {
        this.attr.y += y;
    };

    Translate.prototype.incZ = function(z) {
        this.attr.z += z;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0) ? this._mat.slice(0) : SceneJS_math_translationMat4v([this.attr.x, this.attr.y, this.attr.z]);
    };

    Translate.prototype.getAttributes = function() {
        return {
            x: this.attr.x,
            y: this.attr.y,
            z: this.attr.z
        };
    };

    Translate.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Translate.prototype._preCompile = function(traversalContext) {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            if (SceneJS_modelViewTransformModule.isBuildingViewTransform()) {

                /* When building a view transform, apply the negated translation vector
                 * to correctly transform the SceneJS.Camera
                 */
                this._mat = SceneJS_math_translationMat4v([-this.attr.x, -this.attr.y, -this.attr.z]);
            } else {
                this._mat = SceneJS_math_translationMat4v([this.attr.x, this.attr.y, this.attr.z]);
            }
            this._compileMemoLevel = 1;
        }
        var superXForm = SceneJS_modelViewTransformModule.getTransform();
        if (origMemoLevel < 2 || (!superXForm.fixed)) {
            var instancing = SceneJS_instancingModule.instancing();

            var tempMat = SceneJS_math_mat4();
            SceneJS_math_mulMat4(superXForm.matrix, this._mat, tempMat);
            this._xform = {
                localMatrix: this._mat,
                matrix: tempMat,
                fixed: origMemoLevel == 2
            };

            if (this._compileMemoLevel == 1 && superXForm.fixed && !instancing) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelViewTransformModule.pushTransform(this.attr.id, this._xform);
    };

    Translate.prototype._postCompile = function(traversalContext) {
        SceneJS_modelViewTransformModule.popTransform();
    };

})();