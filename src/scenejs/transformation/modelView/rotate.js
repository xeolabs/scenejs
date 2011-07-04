(function () {
    var Rotate = SceneJS.createNodeType("rotate");

    Rotate.prototype._init = function(params) {
        this._mat = null;
        this._xform = null;
        this.setAngle(params.angle);
        this.setXYZ({x : params.x, y: params.y, z: params.z });
    };

    Rotate.prototype.setAngle = function(angle) {
        this.attr.angle = angle || 0;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getAngle = function() {
        return this.attr.angle;
    };

    Rotate.prototype.setXYZ = function(xyz) {
        xyz = xyz || {};
        var x = xyz.x || 0;
        var y = xyz.y || 0;
        var z = xyz.z || 0;
        this.attr.x = x;
        this.attr.y = y;
        this.attr.z = z;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getXYZ = function() {
        return {
            x: this.attr.x,
            y: this.attr.y,
            z: this.attr.z
        };
    };

    Rotate.prototype.setX = function(x) {
        this.attr.x = x;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getX = function() {
        return this.attr.x;
    };

    Rotate.prototype.setY = function(y) {
        this.attr.y = y;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getY = function() {
        return this.attr.y;
    };

    Rotate.prototype.setZ = function(z) {
        this.attr.z = z;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getZ = function() {
        return this.attr.z;
    };

    Rotate.prototype.incX = function(x) {
        this.attr.x += x;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.incY = function(y) {
        this.attr.y += y;
    };

    Rotate.prototype.incZ = function(z) {
        this.attr.z += z;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.incAngle = function(angle) {
        this.attr.angle += angle;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0)
                ? this._mat.slice(0)
                : SceneJS_math_rotationMat4v(this.attr.angle * Math.PI / 180.0, [this.attr.x, this.attr.y, this.attr.z]);
    };

    Rotate.prototype.getAttributes = function() {
        return {
            x: this.attr.x,
            y: this.attr.y,
            z: this.attr.z,
            angle : this.attr.angle
        };
    };

    Rotate.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Rotate.prototype._preCompile = function(traversalContext) {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._compileMemoLevel = 1;
            if (this.attr.x != 0 || this.attr.y != 0 || this.attr.z != 0) {

                /* When building a view transform, apply the negated rotation angle
                 * to correctly transform the SceneJS.Camera
                 */
                var angle = SceneJS_modelViewTransformModule.isBuildingViewTransform()
                        ? -this.attr.angle
                        : this.attr.angle;
                this._mat = SceneJS_math_rotationMat4v(angle * Math.PI / 180.0, [this.attr.x, this.attr.y, this.attr.z]);
            } else {
                this._mat = SceneJS_math_identityMat4();
            }
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

    Rotate.prototype._postCompile = function(traversalContext) {
        SceneJS_modelViewTransformModule.popTransform();
    };

})();


