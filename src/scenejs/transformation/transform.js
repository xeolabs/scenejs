(function () {

    var Transform = SceneJS.createNodeType("transform");

    Transform.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setMultOrder(params.multOrder);
            this.setTranslateXYZ({x : params.x, y: params.y, z: params.z });
            this.setScaleXYZ({x : params.x, y: params.y, z: params.z });
            this.setRotateXYZ({x : params.x, y: params.y, z: params.z });
        }
        this._mat = null;
        this._xf = null;
    };

    Transform.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal transform multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.core.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
    };

    Transform.prototype.setTranslateXYZ = function(xyz) {
        xyz = xyz || {};
        this._translate = {x : xyz.x || 0, y: xyz.y || 0, z: xyz.z || 0 };
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getTranslateXYZ = function() {
        return {
            x: this._translate.x,
            y: this._translate.y,
            z: this._translate.z
        };
    };

    Transform.prototype.setTranslateX = function(x) {
        this._translate.x = x;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getX = function() {
        return this._translate.x;
    };

    Transform.prototype.setTranslateY = function(y) {
        this._translate.y = y;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getTranslateY = function() {
        return this._translate.y;
    };

    Transform.prototype.setTranslateZ = function(z) {
        this._translate.z = z;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getTranslateZ = function() {
        return this._translate.z;
    };

    Transform.prototype.setScaleXYZ = function(xyz) {
        xyz = xyz || {};
        this._scale = {x : xyz.x || 0, y: xyz.y || 0, z: xyz.z || 0 };
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getScaleXYZ = function() {
        return {
            x: this._scale.x,
            y: this._scale.y,
            z: this._scale.z
        };
    };

    Transform.prototype.setScaleX = function(x) {
        this._scale.x = x;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getX = function() {
        return this._scale.x;
    };

    Transform.prototype.setScaleY = function(y) {
        this._scale.y = y;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getScaleY = function() {
        return this._scale.y;
    };

    Transform.prototype.setScaleZ = function(z) {
        this._scale.z = z;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getScaleZ = function() {
        return this._scale.z;
    };

    Transform.prototype.setRotateXYZ = function(xyz) {
        xyz = xyz || {};
        this._rotate = {x : xyz.x || 0, y: xyz.y || 0, z: xyz.z || 0 };
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getRotateXYZ = function() {
        return {
            x: this._rotate.x,
            y: this._rotate.y,
            z: this._rotate.z
        };
    };

    Transform.prototype.setRotateX = function(x) {
        this._rotate.x = x;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getX = function() {
        return this._rotate.x;
    };

    Transform.prototype.setRotateY = function(y) {
        this._rotate.y = y;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getRotateY = function() {
        return this._rotate.y;
    };

    Transform.prototype.setRotateZ = function(z) {
        this._rotate.z = z;
        this._resetCompilationMemos();
        return this;
    };

    Transform.prototype.getRotateZ = function() {
        return this._rotate.z;
    };

    Transform.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Transform.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {

            /* Scale
             */
            this._mat = SceneJS_math_scalingMat4v([-this._scale.x, -this._scale.y, -this._scale.z]);

            /* Rotation
             */
            if (this._rotate.x + this._rotate.y + this._rotate.z > 0) {

                /* When building a view transform, apply the negated rotation angle
                 * to correctly transform the SceneJS.Camera
                 */

                var mat1 = SceneJS_math_rotationMat4v(this._rotate.x * Math.PI / 180.0, [1, 0, 0]);
                var mat2 = SceneJS_math_rotationMat4v(this._rotate.y * Math.PI / 180.0, [0, 1, 0]);
                var mat3 = SceneJS_math_rotationMat4v(this._rotate.z * Math.PI / 180.0, [0, 0, 1]);

                SceneJS_math_mulMat4(mat3, SceneJS_math_mulMat4(mat2, SceneJS_math_mulMat4(mat1, this._mat)), this._mat);
            } else {
                this._mat = SceneJS_math_identityMat4();
            }

            /* Translation
             */
            if (this._translate.x + this._translate.y + this._translate.z > 0) {
                SceneJS_math_mulMat4(this._mat, SceneJS_math_translationMat4v([ this._translate.x,  this._translate.y,  this._translate.z]));
            }

            this._compileMemoLevel = 1;
        }
        var superXForm = SceneJS_modelTransformModule.transform;
        if (origMemoLevel < 2 || (!superXForm.fixed)) {
            var tempMat = SceneJS_math_mat4();

            if (this._postMult) {
                SceneJS_math_mulMat4(superXForm.matrix, this._mat, tempMat);
            } else {
                SceneJS_math_mulMat4(this._mat, superXForm.matrix, tempMat);
            }

            this._xf.localMatrix = this._mat;
            this._xf.matrix = tempMat;
            this._xf.fixed = origMemoLevel == 2;

            if (this._compileMemoLevel == 1 && superXForm.fixed) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this._xf);
    };

    Transform.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };

})();