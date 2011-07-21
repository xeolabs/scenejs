(function () {
    var Rotate = SceneJS.createNodeType("rotate");

    Rotate.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setMultOrder(params.multOrder);
            this.setAngle(params.angle);
            this.setXYZ({x : params.x, y: params.y, z: params.z });
        }
        this._mat = null;
        this._xf = {};
    };

    Rotate.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal rotate multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.core.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.setAngle = function(angle) {
        this.core.angle = angle || 0;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getAngle = function() {
        return this.core.angle;
    };

    Rotate.prototype.setXYZ = function(xyz) {
        xyz = xyz || {};
        this.core.x = xyz.x || 0;
        this.core.y = xyz.y || 0;
        this.core.z = xyz.z || 0;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getXYZ = function() {
        return {
            x: this.core.x,
            y: this.core.y,
            z: this.core.z
        };
    };

    Rotate.prototype.setX = function(x) {
        this.core.x = x;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getX = function() {
        return this.core.x;
    };

    Rotate.prototype.setY = function(y) {
        this.core.y = y;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getY = function() {
        return this.core.y;
    };

    Rotate.prototype.setZ = function(z) {
        this.core.z = z;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getZ = function() {
        return this.core.z;
    };

    Rotate.prototype.incX = function(x) {
        this.core.x += x;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.incY = function(y) {
        this.core.y += y;
    };

    Rotate.prototype.incZ = function(z) {
        this.core.z += z;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.incAngle = function(angle) {
        this.core.angle += angle;
        this._compileMemoLevel = 0;
    };

    Rotate.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0)
                ? this._mat.slice(0)
                : SceneJS_math_rotationMat4v(this.core.angle * Math.PI / 180.0, [this.core.x, this.core.y, this.core.z]);
    };

    Rotate.prototype.getAttributes = function() {
        return {
            x: this.core.x,
            y: this.core.y,
            z: this.core.z,
            angle : this.core.angle
        };
    };

    Rotate.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Rotate.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._compileMemoLevel = 1;
            if (this.core.x != 0 || this.core.y != 0 || this.core.z != 0) {

                /* When building a view transform, apply the negated rotation angle
                 * to correctly transform the SceneJS.Camera
                 */
                var angle = this.core.angle;
                this._mat = SceneJS_math_rotationMat4v(angle * Math.PI / 180.0, [this.core.x, this.core.y, this.core.z]);
            } else {
                this._mat = SceneJS_math_identityMat4();
            }
        }
        var superXForm = SceneJS_modelTransformModule.transform;
        if (origMemoLevel < 2 || (!superXForm.fixed)) {
            var instancing = SceneJS_instancingModule.instancing();
            var tempMat = SceneJS_math_mat4();

            if (this._postMult) {
                SceneJS_math_mulMat4(superXForm.matrix, this._mat, tempMat);
            } else {
                SceneJS_math_mulMat4(this._mat, superXForm.matrix, tempMat);
            }

            this._xf.localMatrix = this._mat;
            this._xf.matrix = tempMat;
            this._xf.fixed = origMemoLevel == 2;

            if (this._compileMemoLevel == 1 && superXForm.fixed && !instancing) {   // Bump up memoization level if model-space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this._xf);
    };

    Rotate.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };

})();


