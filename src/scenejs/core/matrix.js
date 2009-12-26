SceneJs.utils.Matrix4 = function(m)
{
    if (m && typeof m == 'object') {
        if ("length" in m && m.length >= 16) {
            this.load(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]);
            return;
        }
        else if (m instanceof SceneJs.utils.Matrix4) {
            this.load(m);
            return;
        }
    }
    this.makeIdentity();
}

SceneJs.utils.Matrix4.prototype.load = function()
{
    if (arguments.length == 1 && typeof arguments[0] == 'object') {
        var matrix = arguments[0];

        if ("length" in matrix && matrix.length == 16) {
            this.e11 = matrix[0];
            this.e12 = matrix[1];
            this.e13 = matrix[2];
            this.e14 = matrix[3];

            this.e21 = matrix[4];
            this.e22 = matrix[5];
            this.e23 = matrix[6];
            this.e24 = matrix[7];

            this.e31 = matrix[8];
            this.e32 = matrix[9];
            this.e33 = matrix[10];
            this.e34 = matrix[11];

            this.e41 = matrix[12];
            this.e42 = matrix[13];
            this.e43 = matrix[14];
            this.e44 = matrix[15];
            return;
        }

        if (arguments[0] instanceof SceneJs.utils.Matrix4) {

            this.e11 = matrix.e11;
            this.e12 = matrix.e12;
            this.e13 = matrix.e13;
            this.e14 = matrix.e14;

            this.e21 = matrix.e21;
            this.e22 = matrix.e22;
            this.e23 = matrix.e23;
            this.e24 = matrix.e24;

            this.e31 = matrix.e31;
            this.e32 = matrix.e32;
            this.e33 = matrix.e33;
            this.e34 = matrix.e34;

            this.e41 = matrix.e41;
            this.e42 = matrix.e42;
            this.e43 = matrix.e43;
            this.e44 = matrix.e44;
            return;
        }
    }

    this.makeIdentity();
}

SceneJs.utils.Matrix4.prototype.getAsArray = function()
{
    return [
        this.e11, this.e12, this.e13, this.e14,
        this.e21, this.e22, this.e23, this.e24,
        this.e31, this.e32, this.e33, this.e34,
        this.e41, this.e42, this.e43, this.e44
    ];
}

SceneJs.utils.Matrix4.prototype.getAsWebGLFloatArray = function()
{
    return new WebGLFloatArray(this.getAsArray());
}

SceneJs.utils.Matrix4.prototype.makeIdentity = function()
{
    this.e11 = 1;
    this.e12 = 0;
    this.e13 = 0;
    this.e14 = 0;

    this.e21 = 0;
    this.e22 = 1;
    this.e23 = 0;
    this.e24 = 0;

    this.e31 = 0;
    this.e32 = 0;
    this.e33 = 1;
    this.e34 = 0;

    this.e41 = 0;
    this.e42 = 0;
    this.e43 = 0;
    this.e44 = 1;
}

SceneJs.utils.Matrix4.prototype.transpose = function()
{
    var tmp = this.e12;
    this.e12 = this.e21;
    this.e21 = tmp;

    tmp = this.e13;
    this.e13 = this.e31;
    this.e31 = tmp;

    tmp = this.e14;
    this.e14 = this.e41;
    this.e41 = tmp;

    tmp = this.e23;
    this.e23 = this.e32;
    this.e32 = tmp;

    tmp = this.e24;
    this.e24 = this.e42;
    this.e42 = tmp;

    tmp = this.e34;
    this.e34 = this.e43;
    this.e43 = tmp;
}

SceneJs.utils.Matrix4.prototype.invert = function()
{
    // Calculate the 4x4 determinant
    // If the determinant is zero,
    // then the inverse matrix is not unique.
    var det = this._determinant4x4();

    if (Math.abs(det) < 1e-8)
        return null;

    this._makeAdjoint();

    // Scale the adjoint matrix to get the inverse
    this.e11 /= det;
    this.e12 /= det;
    this.e13 /= det;
    this.e14 /= det;

    this.e21 /= det;
    this.e22 /= det;
    this.e23 /= det;
    this.e24 /= det;

    this.e31 /= det;
    this.e32 /= det;
    this.e33 /= det;
    this.e34 /= det;

    this.e41 /= det;
    this.e42 /= det;
    this.e43 /= det;
    this.e44 /= det;
}

SceneJs.utils.Matrix4.prototype.translate = function(x, y, z)
{
    if (x == undefined)
        x = 0;
    if (y == undefined)
        y = 0;
    if (z == undefined)
        z = 0;

    var matrix = new SceneJs.utils.Matrix4();
    matrix.e41 = x;
    matrix.e42 = y;
    matrix.e43 = z;

    this.multRight(matrix);
}

SceneJs.utils.Matrix4.prototype.scale = function(x, y, z)
{
    if (x == undefined)
        x = 1;
    if (z == undefined) {
        if (y == undefined) {
            y = x;
            z = x;
        }
        else
            z = 1;
    }
    else if (y == undefined)
        y = x;

    var matrix = new SceneJs.utils.Matrix4();
    matrix.e11 = x;
    matrix.e22 = y;
    matrix.e33 = z;

    this.multRight(matrix);
}

SceneJs.utils.Matrix4.prototype.rotate = function(angle, x, y, z)
{
    // angles are in degrees. Switch to radians
    angle = angle / 180 * Math.PI;

    angle /= 2;
    var sinA = Math.sin(angle);
    var cosA = Math.cos(angle);
    var sinA2 = sinA * sinA;

    // normalize
    var length = Math.sqrt(x * x + y * y + z * z);
    if (length == 0) {
        // bad vector, just use something reasonable
        x = 0;
        y = 0;
        z = 1;
    } else if (length != 1) {
        x /= length;
        y /= length;
        z /= length;
    }

    var mat = new SceneJs.utils.Matrix4();

    // optimize case where axis is along major axis
    if (x == 1 && y == 0 && z == 0) {
        mat.e11 = 1;
        mat.e12 = 0;
        mat.e13 = 0;
        mat.e21 = 0;
        mat.e22 = 1 - 2 * sinA2;
        mat.e23 = 2 * sinA * cosA;
        mat.e31 = 0;
        mat.e32 = -2 * sinA * cosA;
        mat.e33 = 1 - 2 * sinA2;
        mat.e14 = mat.e24 = mat.e34 = 0;
        mat.e41 = mat.e42 = mat.e43 = 0;
        mat.e44 = 1;
    } else if (x == 0 && y == 1 && z == 0) {
        mat.e11 = 1 - 2 * sinA2;
        mat.e12 = 0;
        mat.e13 = -2 * sinA * cosA;
        mat.e21 = 0;
        mat.e22 = 1;
        mat.e23 = 0;
        mat.e31 = 2 * sinA * cosA;
        mat.e32 = 0;
        mat.e33 = 1 - 2 * sinA2;
        mat.e14 = mat.e24 = mat.e34 = 0;
        mat.e41 = mat.e42 = mat.e43 = 0;
        mat.e44 = 1;
    } else if (x == 0 && y == 0 && z == 1) {
        mat.e11 = 1 - 2 * sinA2;
        mat.e12 = 2 * sinA * cosA;
        mat.e13 = 0;
        mat.e21 = -2 * sinA * cosA;
        mat.e22 = 1 - 2 * sinA2;
        mat.e23 = 0;
        mat.e31 = 0;
        mat.e32 = 0;
        mat.e33 = 1;
        mat.e14 = mat.e24 = mat.e34 = 0;
        mat.e41 = mat.e42 = mat.e43 = 0;
        mat.e44 = 1;
    } else {
        var x2 = x * x;
        var y2 = y * y;
        var z2 = z * z;

        mat.e11 = 1 - 2 * (y2 + z2) * sinA2;
        mat.e12 = 2 * (x * y * sinA2 + z * sinA * cosA);
        mat.e13 = 2 * (x * z * sinA2 - y * sinA * cosA);
        mat.e21 = 2 * (y * x * sinA2 - z * sinA * cosA);
        mat.e22 = 1 - 2 * (z2 + x2) * sinA2;
        mat.e23 = 2 * (y * z * sinA2 + x * sinA * cosA);
        mat.e31 = 2 * (z * x * sinA2 + y * sinA * cosA);
        mat.e32 = 2 * (z * y * sinA2 - x * sinA * cosA);
        mat.e33 = 1 - 2 * (x2 + y2) * sinA2;
        mat.e14 = mat.e24 = mat.e34 = 0;
        mat.e41 = mat.e42 = mat.e43 = 0;
        mat.e44 = 1;
    }
    this.multRight(mat);
}

SceneJs.utils.Matrix4.prototype.multRight = function(mat)
{
    var e11 = (this.e11 * mat.e11 + this.e12 * mat.e21
            + this.e13 * mat.e31 + this.e14 * mat.e41);
    var e12 = (this.e11 * mat.e12 + this.e12 * mat.e22
            + this.e13 * mat.e32 + this.e14 * mat.e42);
    var e13 = (this.e11 * mat.e13 + this.e12 * mat.e23
            + this.e13 * mat.e33 + this.e14 * mat.e43);
    var e14 = (this.e11 * mat.e14 + this.e12 * mat.e24
            + this.e13 * mat.e34 + this.e14 * mat.e44);

    var e21 = (this.e21 * mat.e11 + this.e22 * mat.e21
            + this.e23 * mat.e31 + this.e24 * mat.e41);
    var e22 = (this.e21 * mat.e12 + this.e22 * mat.e22
            + this.e23 * mat.e32 + this.e24 * mat.e42);
    var e23 = (this.e21 * mat.e13 + this.e22 * mat.e23
            + this.e23 * mat.e33 + this.e24 * mat.e43);
    var e24 = (this.e21 * mat.e14 + this.e22 * mat.e24
            + this.e23 * mat.e34 + this.e24 * mat.e44);

    var e31 = (this.e31 * mat.e11 + this.e32 * mat.e21
            + this.e33 * mat.e31 + this.e34 * mat.e41);
    var e32 = (this.e31 * mat.e12 + this.e32 * mat.e22
            + this.e33 * mat.e32 + this.e34 * mat.e42);
    var e33 = (this.e31 * mat.e13 + this.e32 * mat.e23
            + this.e33 * mat.e33 + this.e34 * mat.e43);
    var e34 = (this.e31 * mat.e14 + this.e32 * mat.e24
            + this.e33 * mat.e34 + this.e34 * mat.e44);

    var e41 = (this.e41 * mat.e11 + this.e42 * mat.e21
            + this.e43 * mat.e31 + this.e44 * mat.e41);
    var e42 = (this.e41 * mat.e12 + this.e42 * mat.e22
            + this.e43 * mat.e32 + this.e44 * mat.e42);
    var e43 = (this.e41 * mat.e13 + this.e42 * mat.e23
            + this.e43 * mat.e33 + this.e44 * mat.e43);
    var e44 = (this.e41 * mat.e14 + this.e42 * mat.e24
            + this.e43 * mat.e34 + this.e44 * mat.e44);

    this.e11 = e11;
    this.e12 = e12;
    this.e13 = e13;
    this.e14 = e14;

    this.e21 = e21;
    this.e22 = e22;
    this.e23 = e23;
    this.e24 = e24;

    this.e31 = e31;
    this.e32 = e32;
    this.e33 = e33;
    this.e34 = e34;

    this.e41 = e41;
    this.e42 = e42;
    this.e43 = e43;
    this.e44 = e44;
}

SceneJs.utils.Matrix4.prototype.multLeft = function(mat)
{
    var e11 = (mat.e11 * this.e11 + mat.e12 * this.e21
            + mat.e13 * this.e31 + mat.e14 * this.e41);
    var e12 = (mat.e11 * this.e12 + mat.e12 * this.e22
            + mat.e13 * this.e32 + mat.e14 * this.e42);
    var e13 = (mat.e11 * this.e13 + mat.e12 * this.e23
            + mat.e13 * this.e33 + mat.e14 * this.e43);
    var e14 = (mat.e11 * this.e14 + mat.e12 * this.e24
            + mat.e13 * this.e34 + mat.e14 * this.e44);

    var e21 = (mat.e21 * this.e11 + mat.e22 * this.e21
            + mat.e23 * this.e31 + mat.e24 * this.e41);
    var e22 = (mat.e21 * this.e12 + mat.e22 * this.e22
            + mat.e23 * this.e32 + mat.e24 * this.e42);
    var e23 = (mat.e21 * this.e13 + mat.e22 * this.e23
            + mat.e23 * this.e33 + mat.e24 * this.e43);
    var e24 = (mat.e21 * this.e14 + mat.e22 * this.e24
            + mat.e23 * this.e34 + mat.e24 * this.e44);

    var e31 = (mat.e31 * this.e11 + mat.e32 * this.e21
            + mat.e33 * this.e31 + mat.e34 * this.e41);
    var e32 = (mat.e31 * this.e12 + mat.e32 * this.e22
            + mat.e33 * this.e32 + mat.e34 * this.e42);
    var e33 = (mat.e31 * this.e13 + mat.e32 * this.e23
            + mat.e33 * this.e33 + mat.e34 * this.e43);
    var e34 = (mat.e31 * this.e14 + mat.e32 * this.e24
            + mat.e33 * this.e34 + mat.e34 * this.e44);

    var e41 = (mat.e41 * this.e11 + mat.e42 * this.e21
            + mat.e43 * this.e31 + mat.e44 * this.e41);
    var e42 = (mat.e41 * this.e12 + mat.e42 * this.e22
            + mat.e43 * this.e32 + mat.e44 * this.e42);
    var e43 = (mat.e41 * this.e13 + mat.e42 * this.e23
            + mat.e43 * this.e33 + mat.e44 * this.e43);
    var e44 = (mat.e41 * this.e14 + mat.e42 * this.e24
            + mat.e43 * this.e34 + mat.e44 * this.e44);

    this.e11 = e11;
    this.e12 = e12;
    this.e13 = e13;
    this.e14 = e14;

    this.e21 = e21;
    this.e22 = e22;
    this.e23 = e23;
    this.e24 = e24;

    this.e31 = e31;
    this.e32 = e32;
    this.e33 = e33;
    this.e34 = e34;

    this.e41 = e41;
    this.e42 = e42;
    this.e43 = e43;
    this.e44 = e44;
}

SceneJs.utils.Matrix4.prototype.ortho = function(left, right, bottom, top, near, far)
{
    var tx = (left + right) / (left - right);
    var ty = (top + bottom) / (top - bottom);
    var tz = (far + near) / (far - near);

    var matrix = new SceneJs.utils.Matrix4();
    matrix.e11 = 2 / (left - right);
    matrix.e12 = 0;
    matrix.e13 = 0;
    matrix.e14 = 0;
    matrix.e21 = 0;
    matrix.e22 = 2 / (top - bottom);
    matrix.e23 = 0;
    matrix.e24 = 0;
    matrix.e31 = 0;
    matrix.e32 = 0;
    matrix.e33 = -2 / (far - near);
    matrix.e34 = 0;
    matrix.e41 = tx;
    matrix.e42 = ty;
    matrix.e43 = tz;
    matrix.e44 = 1;

    this.multRight(matrix);
}

SceneJs.utils.Matrix4.prototype.frustum = function(left, right, bottom, top, near, far)
{
    var matrix = new SceneJs.utils.Matrix4();
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(far + near) / (far - near);
    var D = -(2 * far * near) / (far - near);

    matrix.e11 = (2 * near) / (right - left);
    matrix.e12 = 0;
    matrix.e13 = 0;
    matrix.e14 = 0;

    matrix.e21 = 0;
    matrix.e22 = 2 * near / (top - bottom);
    matrix.e23 = 0;
    matrix.e24 = 0;

    matrix.e31 = A;
    matrix.e32 = B;
    matrix.e33 = C;
    matrix.e34 = -1;

    matrix.e41 = 0;
    matrix.e42 = 0;
    matrix.e43 = D;
    matrix.e44 = 0;

    this.multRight(matrix);
}

SceneJs.utils.Matrix4.prototype.perspective = function(fovy, aspect, zNear, zFar)
{
    var top = Math.tan(fovy * Math.PI / 360) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    this.frustum(left, right, bottom, top, zNear, zFar);
}

SceneJs.utils.Matrix4.prototype.lookat = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz)
{
    var matrix = new SceneJs.utils.Matrix4();

    // Make rotation matrix

    // Z vector
    var zx = eyex - centerx;
    var zy = eyey - centery;
    var zz = eyez - centerz;
    var mag = Math.sqrt(zx * zx + zy * zy + zz * zz);
    if (mag) {
        zx /= mag;
        zy /= mag;
        zz /= mag;
    }

    // Y vector
    var yx = upx;
    var yy = upy;
    var yz = upz;

    // X vector = Y cross Z
    var xx = yy * zz - yz * zy;
    var xy = -yx * zz + yz * zx;
    var xz = yx * zy - yy * zx;

    // Recompute Y = Z cross X
    yx = zy * xz - zz * xy;
    yy = -zx * xz + zz * xx;
    yx = zx * xy - zy * xx;

    // cross product gives area of parallelogram, which is < 1.0 for
    // non-perpendicular unit-length vectors; so normalize x, y here

    mag = Math.sqrt(xx * xx + xy * xy + xz * xz);
    if (mag) {
        xx /= mag;
        xy /= mag;
        xz /= mag;
    }

    mag = Math.sqrt(yx * yx + yy * yy + yz * yz);
    if (mag) {
        yx /= mag;
        yy /= mag;
        yz /= mag;
    }

    matrix.e11 = xx;
    matrix.e12 = xy;
    matrix.e13 = xz;
    matrix.e14 = 0;

    matrix.e21 = yx;
    matrix.e22 = yy;
    matrix.e23 = yz;
    matrix.e24 = 0;

    matrix.e31 = zx;
    matrix.e32 = zy;
    matrix.e33 = zz;
    matrix.e34 = 0;

    matrix.e41 = 0;
    matrix.e42 = 0;
    matrix.e43 = 0;
    matrix.e44 = 1;
    matrix.translate(-eyex, -eyey, -eyez);

    this.multRight(matrix);
};

// Support functions
SceneJs.utils.Matrix4.prototype._determinant2x2 = function(a, b, c, d)
{
    return a * d - b * c;
}

SceneJs.utils.Matrix4.prototype._determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3)
{
    return a1 * this._determinant2x2(b2, b3, c2, c3)
            - b1 * this._determinant2x2(a2, a3, c2, c3)
            + c1 * this._determinant2x2(a2, a3, b2, b3);
}

SceneJs.utils.Matrix4.prototype._determinant4x4 = function()
{
    var a1 = this.e11;
    var b1 = this.e12;
    var c1 = this.e13;
    var d1 = this.e14;

    var a2 = this.e21;
    var b2 = this.e22;
    var c2 = this.e23;
    var d2 = this.e24;

    var a3 = this.e31;
    var b3 = this.e32;
    var c3 = this.e33;
    var d3 = this.e34;

    var a4 = this.e41;
    var b4 = this.e42;
    var c4 = this.e43;
    var d4 = this.e44;

    return a1 * this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
            - b1 * this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
            + c1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
            - d1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
}

SceneJs.utils.Matrix4.prototype._makeAdjoint = function()
{
    var a1 = this.e11;
    var b1 = this.e12;
    var c1 = this.e13;
    var d1 = this.e14;

    var a2 = this.e21;
    var b2 = this.e22;
    var c2 = this.e23;
    var d2 = this.e24;

    var a3 = this.e31;
    var b3 = this.e32;
    var c3 = this.e33;
    var d3 = this.e34;

    var a4 = this.e41;
    var b4 = this.e42;
    var c4 = this.e43;
    var d4 = this.e44;

    // Row column labeling reversed since we transpose rows & columns
    this.e11 = this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
    this.e21 = - this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
    this.e31 = this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
    this.e41 = - this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);

    this.e12 = - this._determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
    this.e22 = this._determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
    this.e32 = - this._determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
    this.e42 = this._determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);

    this.e13 = this._determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
    this.e23 = - this._determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
    this.e33 = this._determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
    this.e43 = - this._determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);

    this.e14 = - this._determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
    this.e24 = this._determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
    this.e34 = - this._determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
    this.e44 = this._determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
}


SceneJs.utils.Matrix4.prototype.transformVector3 = function(v) {
    return {
        x:(this.e11 * v.x) + (this.e12 * v.y) + (this.e13 * v.z),
        y:(this.e21 * v.x) + (this.e22 * v.y) + (this.e23 * v.z),
        z:(this.e31 * v.x) + (this.e32 * v.y) + (this.e33 * v.z)
    };
};