(function () {

    var Translate = SceneJS.createNodeType("translate");

    Translate.prototype._init = function(params) {
        this._mat = null;
        this._xf = {};
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setMultOrder(params.multOrder);
            this.setXyz({x : params.x, y: params.y, z: params.z });
        }
    };

    Translate.prototype.setMultOrder = function(multOrder) {
        multOrder = multOrder || "post";
        if (multOrder != "post" && multOrder != "pre") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Illegal translate multOrder - '" + multOrder + "' should be 'pre' or 'post'");
        }
        this.core.multOrder = multOrder;
        this._postMult = (multOrder == "post");
        this._compileMemoLevel = 0;
    };

    Translate.prototype.setXyz = function(xyz) {
        xyz = xyz || {};
        var x = xyz.x || 0;
        var y = xyz.y || 0;
        var z = xyz.z || 0;
        this.core.x = x;
        this.core.y = y;
        this.core.z = z;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getXyz = function() {
        return {
            x: this.core.x,
            y: this.core.y,
            z: this.core.z
        };
    };

    Translate.prototype.setX = function(x) {
        this.core.x = x;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getX = function() {
        return this.core.x;
    };

    Translate.prototype.setY = function(y) {
        this.core.y = y;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getY = function() {
        return this.core.y;
    };

    Translate.prototype.setZ = function(z) {
        this.core.z = z;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getZ = function() {
        return this.core.z;
    };

    Translate.prototype.incX = function(x) {
        this.core.x += x;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.incY = function(y) {
        this.core.y += y;
    };

    Translate.prototype.incZ = function(z) {
        this.core.z += z;
        this._compileMemoLevel = 0;
    };

    Translate.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0) ? this._mat.slice(0) : SceneJS_math_translationMat4v([this.core.x, this.core.y, this.core.z]);
    };

    Translate.prototype.getAttributes = function() {
        return {
            x: this.core.x,
            y: this.core.y,
            z: this.core.z
        };
    };

    Translate.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Translate.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._mat = SceneJS_math_translationMat4v([this.core.x, this.core.y, this.core.z]);
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

            if (this._compileMemoLevel == 1 && superXForm.fixed) {
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_modelTransformModule.pushTransform(this.attr.id, this._xf);
    };

    Translate.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };

})();