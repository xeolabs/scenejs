(function () {

    var Quaternion = SceneJS.createNodeType("quaternion");

    Quaternion.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setMultOrder(params.multOrder);

            this.core.q = SceneJS_math_identityQuaternion();

            if (params.x || params.y || params.x || params.angle || params.w) {
                this.setRotation(params);
            }
            if (params.rotations) {
                for (var i = 0; i < params.rotations.length; i++) {
                    this.addRotation(params.rotations[i]);
                }
            }
        }
        this._mat = null;
        this._xf = {};

    };

    Quaternion.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal quaternion multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.core.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
    };

    Quaternion.prototype.setRotation = function(q) {
        q = q || {};
        this.core.q = SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0);
        this._resetCompilationMemos();
        return this;
    };

    Quaternion.prototype.getRotation = function() {
        return SceneJS_math_angleAxisFromQuaternion(this.core.q);
    };

    Quaternion.prototype.addRotation = function(q) {
        this.core.q = SceneJS_math_mulQuaternions(SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0), this.core.q);
        this._resetCompilationMemos();
        return this;
    };

    Quaternion.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0) ? this._mat.slice(0) : SceneJS_math_newMat4FromQuaternion(this.core.q);
    };

    Quaternion.prototype.normalize = function() {
        this.core.q = SceneJS_math_normalizeQuaternion(this.core.q);
        this._resetCompilationMemos();
        return this;
    };

    Quaternion.prototype.getAttributes = function() {
        return {
            x: this.core.q[0],
            y: this.core.q[1],
            z: this.core.q[2],
            w: this.core.q[3]
        };
    };

    Quaternion.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Quaternion.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._mat = SceneJS_math_newMat4FromQuaternion(this.core.q);
            this._compileMemoLevel = 1;
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

    Quaternion.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };

})();