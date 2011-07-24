(function() {

    var Lookat = SceneJS.createNodeType("lookAt");

    Lookat.prototype._init = function(params) {
        this._mat = null;
        this._xf = {
            type: "lookat"
        };
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.setEye(params.eye);
            this.setLook(params.look);
            this.setUp(params.up);
        }
    };

    Lookat.prototype.setEye = function(eye) {
        eye = eye || {};
        this.core.eyeX = (eye.x != undefined && eye.x != null) ? eye.x : 0;
        this.core.eyeY = (eye.y != undefined && eye.y != null) ? eye.y : 0;
        this.core.eyeZ = (eye.z != undefined && eye.z != null) ? eye.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setEyeX = function(x) {
        this.core.eyeX = x || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setEyeY = function(y) {
        this.core.eyeY = y || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEye = function(eye) {
        eye = eye || {};
        this.core.eyeX += (eye.x != undefined && eye.x != null) ? eye.x : 0;
        this.core.eyeY += (eye.y != undefined && eye.y != null) ? eye.y : 0;
        this.core.eyeZ += (eye.z != undefined && eye.z != null) ? eye.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEyeX = function(x) {
        this.core.eyeX += x;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEyeY = function(y) {
        this.core.eyeY += y;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incEyeZ = function(z) {
        this.core.eyeZ += z;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setEyeZ = function(z) {
        this.core.eyeZ = z || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.getEye = function() {
        return {
            x: this.core.eyeX,
            y: this.core.eyeY,
            z: this.core.eyeZ
        };
    };

    Lookat.prototype.setLook = function(look) {
        look = look || {};
        this.core.lookX = (look.x != undefined && look.x != null) ? look.x : 0;
        this.core.lookY = (look.y != undefined && look.y != null) ? look.y : 0;
        this.core.lookZ = (look.z != undefined && look.z != null) ? look.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setLookX = function(x) {
        this.core.lookX = x || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setLookY = function(y) {
        this.core.lookY = y || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setLookZ = function(z) {
        this.core.lookZ = z || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.incLook = function(look) {
        look = look || {};
        this.core.lookX += (look.x != undefined && look.x != null) ? look.x : 0;
        this.core.lookY += (look.y != undefined && look.y != null) ? look.y : 0;
        this.core.lookZ += (look.z != undefined && look.z != null) ? look.z : 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.getLook = function() {
        return {
            x: this.core.lookX,
            y: this.core.lookY,
            z: this.core.lookZ
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
        this.core.upX = x;
        this.core.upY = y;
        this.core.upZ = z;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setUpX = function(x) {
        this.core.upX = x || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setUpY = function(x) {
        this.core.upY = y || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.setUpZ = function(x) {
        this.core.upZ = z || 0;
        this._compileMemoLevel = 0;
    };

    Lookat.prototype.getUp = function() {
        return {
            x: this.core.upX,
            y: this.core.upY,
            z: this.core.upZ
        };
    };

    Lookat.prototype.incUp = function(up) {
        up = up || {};
        this.core.upX += (up.x != undefined && up.x != null) ? up.x : 0;
        this.core.upY += (up.y != undefined && up.y != null) ? up.y : 0;
        this.core.upZ += (up.z != undefined && up.z != null) ? up.z : 0;
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
                this.core.eyeX, this.core.eyeY, this.core.eyeZ,
                this.core.lookX, this.core.lookY, this.core.lookZ,
                this.core.upX, this.core.upY, this.core.upZ);
    };

    Lookat.prototype.getAttributes = function() {
        return {
            look: {
                x: this.core.lookX,
                y: this.core.lookY,
                z: this.core.lookZ
            },
            eye: {
                x: this.core.eyeX,
                y: this.core.eyeY,
                z: this.core.eyeZ
            },
            up: {
                x: this.core.upX,
                y: this.core.upY,
                z: this.core.upZ
            }
        };
    };

    Lookat.prototype._compile = function() {
        if (this._compileMemoLevel == 0) {
            this._mat = SceneJS_math_lookAtMat4c(
                    this.core.eyeX, this.core.eyeY, this.core.eyeZ,
                    this.core.lookX, this.core.lookY, this.core.lookZ,
                    this.core.upX, this.core.upY, this.core.upZ);
            this._compileMemoLevel = 1;
            this._xf.matrix = this._mat;
            this._xf.lookAt = {
                eye: [this.core.eyeX, this.core.eyeY, this.core.eyeZ ],
                look: [this.core.lookX, this.core.lookY, this.core.lookZ ],
                up:  [this.core.upX, this.core.upY, this.core.upZ ]
            };
        }
        SceneJS_viewTransformModule.pushTransform(this.attr.id, this._xf);

        this._compileNodes();

        SceneJS_viewTransformModule.popTransform();
    };

})();