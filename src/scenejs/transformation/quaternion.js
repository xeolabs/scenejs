(function () {

    var Quaternion = SceneJS.createNodeType("quaternion");

    Quaternion.prototype._init = function(params) {
        this._mat = null;
        this._xform = null;

        this.setMultOrder(params.multOrder);

        this._q = SceneJS_math_identityQuaternion();

        if (params.x || params.y || params.x || params.angle || params.w) {
            this.setRotation(params);
        }
        if (params.rotations) {
            for (var i = 0; i < params.rotations.length; i++) {
                this.addRotation(params.rotations[i]);
            }
        }
    };

    Quaternion.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal quaternion multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.attr.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
    };

    Quaternion.prototype.setRotation = function(q) {
        q = q || {};
        this._q = SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0);
        this._resetCompilationMemos();
        return this;
    };

    Quaternion.prototype.getRotation = function() {
        return SceneJS_math_angleAxisFromQuaternion(this._q);
    };

    Quaternion.prototype.addRotation = function(q) {
        this._q = SceneJS_math_mulQuaternions(SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0), this._q);
        this._resetCompilationMemos();
        return this;
    };

    Quaternion.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0) ? this._mat.slice(0) : SceneJS_math_newMat4FromQuaternion(this._q);
    };

    Quaternion.prototype.normalize = function() {
        this._q = SceneJS_math_normalizeQuaternion(this._q);
        this._resetCompilationMemos();
        return this;
    };

    Quaternion.prototype.getAttributes = function() {
        return {
            x: this._q[0],
            y: this._q[1],
            z: this._q[2],
            w: this._q[3]
        };
    };

    Quaternion.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Quaternion.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._mat = SceneJS_math_newMat4FromQuaternion(this._q);
            this._compileMemoLevel = 1;
        }
        var superXform = SceneJS_modelTransformModule.getTransform();
        if (origMemoLevel < 2 || (!superXform.fixed)) {
            var instancing = SceneJS_instancingModule.instancing();
            var tempMat = SceneJS_math_mat4();

            if (this._postMult) {
                SceneJS_math_mulMat4(superXform.matrix, this._mat, tempMat);
            } else {
                SceneJS_math_mulMat4(this._mat, superXform.matrix, tempMat);
            }

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

    Quaternion.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };

})();