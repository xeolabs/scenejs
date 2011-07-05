(function() {

    var Lookat = SceneJS.createNodeType("lookAt");

    Lookat.prototype._init = function(params) {
        this._mat = null;
        this._xform = null;

        this.setEye(params.eye);
        this.setLook(params.look);
        this.setUp(params.up);
    };

    Lookat.prototype.setEye = function(eye) {
        eye = eye || {};
        this._eyeX = (eye.x != undefined && eye.x != null) ? eye.x : 0;
        this._eyeY = (eye.y != undefined && eye.y != null) ? eye.y : 0;
        this._eyeZ = (eye.z != undefined && eye.z != null) ? eye.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setEyeX = function(x) {
        this._eyeX = x || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setEyeY = function(y) {
        this._eyeY = y || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEye = function(eye) {
        eye = eye || {};
        this._eyeX += (eye.x != undefined && eye.x != null) ? eye.x : 0;
        this._eyeY += (eye.y != undefined && eye.y != null) ? eye.y : 0;
        this._eyeZ += (eye.z != undefined && eye.z != null) ? eye.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEyeX = function(x) {
        this._eyeX += x;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEyeY = function(y) {
        this._eyeY += y;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEyeZ = function(z) {
        this._eyeZ += z;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setEyeZ = function(z) {
        this._eyeZ = z || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.getEye = function() {
        return {
            x: this._eyeX,
            y: this._eyeY,
            z: this._eyeZ
        };
    };

    Lookat.prototype.setLook = function(look) {
        look = look || {};
        this._lookX = (look.x != undefined && look.x != null) ? look.x : 0;
        this._lookY = (look.y != undefined && look.y != null) ? look.y : 0;
        this._lookZ = (look.z != undefined && look.z != null) ? look.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setLookX = function(x) {
        this._lookX = x || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setLookY = function(y) {
        this._lookY = y || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setLookZ = function(z) {
        this._lookZ = z || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incLook = function(look) {
        look = look || {};
        this._lookX += (look.x != undefined && look.x != null) ? look.x : 0;
        this._lookY += (look.y != undefined && look.y != null) ? look.y : 0;
        this._lookZ += (look.z != undefined && look.z != null) ? look.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.getLook = function() {
        return {
            x: this._lookX,
            y: this._lookY,
            z: this._lookZ
        };
    };

    Lookat.prototype.setUp = function(up) {
        up = up || { y: 1.0 };
        var x = (up.x != undefined && up.x != null) ? up.x : 0;
        var y = (up.y != undefined && up.y != null) ? up.y : 0;
        var z = (up.z != undefined && up.z != null) ? up.z : 0;
        if (x + y + z == 0) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Lookat up vector is zero length - at least one of its x,y and z components must be non-zero");
        }
        this._upX = x;
        this._upY = y;
        this._upZ = z;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setUpX = function(x) {
        this._upX = x || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setUpY = function(x) {
        this._upY = y || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setUpZ = function(x) {
        this._upZ = z || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.getUp = function() {
        return {
            x: this._upX,
            y: this._upY,
            z: this._upZ
        };
    };

    Lookat.prototype.incUp = function(up) {
        up = up || {};
        this._upX += (up.x != undefined && up.x != null) ? up.x : 0;
        this._upY += (up.y != undefined && up.y != null) ? up.y : 0;
        this._upZ += (up.z != undefined && up.z != null) ? up.z : 0;
        this._compileMemoLevel = 0;
    };

    /**
     * Returns a copy of the matrix as a 1D array of 16 elements
     * @returns {Number[16]}
     */
    Lookat.prototype.getMatrix = function() {
        return (this._compileMemoLevel > 0)
                ? this._mat.slice(0)
                : SceneJS_math_lookAtMat4c(
                this._eyeX, this._eyeY, this._eyeZ,
                this._lookX, this._lookY, this._lookZ,
                this._upX, this._upY, this._upZ);
    };

    Lookat.prototype.getAttributes = function() {
        return {
            look: {
                x: this._lookX,
                y: this._lookY,
                z: this._lookZ
            },
            eye: {
                x: this._eyeX,
                y: this._eyeY,
                z: this._eyeZ
            },
            up: {
                x: this._upX,
                y: this._upY,
                z: this._upZ
            }
        };
    };

    Lookat.prototype._compile = function(traversalContext) {
        this._preCompile();
        this._compileNodes(traversalContext);
        this._postCompile();
    };

    Lookat.prototype._preCompile = function() {
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0) {
            this._mat = SceneJS_math_lookAtMat4c(
                    this._eyeX, this._eyeY, this._eyeZ,
                    this._lookX, this._lookY, this._lookZ,
                    this._upX, this._upY, this._upZ);
            this._compileMemoLevel = 1;
        }
        var superXform = SceneJS_viewTransformModule.getTransform();
        if (this._compileMemoLevel < 2 || (!superXform.fixed)) {
            var tempMat = SceneJS_math_mat4();
            SceneJS_math_mulMat4(superXform.matrix, this._mat, tempMat);
            this._xform = {
                type: "lookat",
                matrix: tempMat,
                lookAt : {
                    eye: [this._eyeX, this._eyeY, this._eyeZ ],
                    look: [this._lookX, this._lookY, this._lookZ ],
                    up:  [this._upX, this._upY, this._upZ ]
                },
                fixed: origMemoLevel == 2
            };
            if (this._compileMemoLevel == 1 && superXform.fixed && !SceneJS_instancingModule.instancing()) {   // Bump up memoization level if space fixed
                this._compileMemoLevel = 2;
            }
        }
        SceneJS_viewTransformModule.pushTransform(this.attr.id, this._xform);
    };

    Lookat.prototype._postCompile = function() {
        SceneJS_viewTransformModule.popTransform();
    };

})();