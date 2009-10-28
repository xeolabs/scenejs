/** A 3D vector
 *
 */
SceneJs.utils.Vector3 = function(x, y, z) {
    this.e = x ? x : 0;
    this.y = y ? y : 0;
    this.z = z ? z : 0;
};

/** Subtracts 3D vector b from a
 *
 */
SceneJs.utils.Vector3.subtract = function(a, b) {
    return new SceneJs.utils.Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
};

/** Returns the cross-product of two 3D vectors
 *
 */
SceneJs.utils.Vector3.cross = function(a, b) {
    return new Scene.utils.Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
};

/**
 * Returns the length of a 3D vector
 */
SceneJs.utils.Vector3.len = function(a) {
    return Math.sqrt((a.x * a.x) + (a.y * a.y) + (a.z * a.z));
};

/** Divides a 3D vector by a divisor
 */
SceneJs.Vector3.divide = function(a, divisor) {
    return new SceneJs.utils.Vector3(a.x / divisor, a.y / divisor, a.z / divisor);
};

/** Scales a 3D vector by a scalar
 */
SceneJs.Vector3.scale = function(a, scalar) {
    return new SceneJs.utils.Vector3(a.x * scalar, a.y * scalar, a.z * scalar);
};

/** Normalises a 3D vector
 */
SceneJs.utils.Vector3.normalize = function(a) {
    return SceneJs.utils.Vector3.divide(a, this.len(a));
};

/** Returns the dot product of two 3D vectors
 */
SceneJs.utils.Vector3.dot = function(a, b) {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
};


SceneJs.utils.Matrix4x4 = function(e) {
    if (e) {
        this.elements = e;
    } else {
        this.elements = Array(16);
        this.loadIdentity();
    }
};

SceneJs.utils.Matrix4x4.prototype = {
    scale: function (sx, sy, sz) {
        this.elements[0 * 4 + 0] *= sx;
        this.elements[0 * 4 + 1] *= sx;
        this.elements[0 * 4 + 2] *= sx;
        this.elements[0 * 4 + 3] *= sx;

        this.elements[1 * 4 + 0] *= sy;
        this.elements[1 * 4 + 1] *= sy;
        this.elements[1 * 4 + 2] *= sy;
        this.elements[1 * 4 + 3] *= sy;

        this.elements[2 * 4 + 0] *= sz;
        this.elements[2 * 4 + 1] *= sz;
        this.elements[2 * 4 + 2] *= sz;
        this.elements[2 * 4 + 3] *= sz;

        return this;
    },

    translate: function (tx, ty, tz) {
        this.elements[3 * 4 + 0] += this.elements[0 * 4 + 0] * tx + this.elements[1 * 4 + 0] * ty + this.elements[2 * 4 + 0] * tz;
        this.elements[3 * 4 + 1] += this.elements[0 * 4 + 1] * tx + this.elements[1 * 4 + 1] * ty + this.elements[2 * 4 + 1] * tz;
        this.elements[3 * 4 + 2] += this.elements[0 * 4 + 2] * tx + this.elements[1 * 4 + 2] * ty + this.elements[2 * 4 + 2] * tz;
        this.elements[3 * 4 + 3] += this.elements[0 * 4 + 3] * tx + this.elements[1 * 4 + 3] * ty + this.elements[2 * 4 + 3] * tz;

        return this;
    },

    rotate: function (angle, x, y, z) {
        var mag = Math.sqrt(x * x + y * y + z * z);
        var sinAngle = Math.sin(angle * Math.PI / 180.0);
        var cosAngle = Math.cos(angle * Math.PI / 180.0);

        if (mag > 0) {
            var xx, yy, zz, xy, yz, zx, xs, ys, zs;
            var oneMinusCos;
            var rotMat;

            x /= mag;
            y /= mag;
            z /= mag;

            xx = x * x;
            yy = y * y;
            zz = z * z;
            xy = x * y;
            yz = y * z;
            zx = z * x;
            xs = x * sinAngle;
            ys = y * sinAngle;
            zs = z * sinAngle;
            oneMinusCos = 1.0 - cosAngle;

            rotMat = new Matrix4x4();

            rotMat.elements[0 * 4 + 0] = (oneMinusCos * xx) + cosAngle;
            rotMat.elements[0 * 4 + 1] = (oneMinusCos * xy) - zs;
            rotMat.elements[0 * 4 + 2] = (oneMinusCos * zx) + ys;
            rotMat.elements[0 * 4 + 3] = 0.0;

            rotMat.elements[1 * 4 + 0] = (oneMinusCos * xy) + zs;
            rotMat.elements[1 * 4 + 1] = (oneMinusCos * yy) + cosAngle;
            rotMat.elements[1 * 4 + 2] = (oneMinusCos * yz) - xs;
            rotMat.elements[1 * 4 + 3] = 0.0;

            rotMat.elements[2 * 4 + 0] = (oneMinusCos * zx) - ys;
            rotMat.elements[2 * 4 + 1] = (oneMinusCos * yz) + xs;
            rotMat.elements[2 * 4 + 2] = (oneMinusCos * zz) + cosAngle;
            rotMat.elements[2 * 4 + 3] = 0.0;

            rotMat.elements[3 * 4 + 0] = 0.0;
            rotMat.elements[3 * 4 + 1] = 0.0;
            rotMat.elements[3 * 4 + 2] = 0.0;
            rotMat.elements[3 * 4 + 3] = 1.0;

            rotMat = rotMat.multiply(this);
            this.elements = rotMat.elements;
        }

        return this;
    },

    frustum: function (left, right, bottom, top, nearZ, farZ) {
        var deltaX = right - left;
        var deltaY = top - bottom;
        var deltaZ = farZ - nearZ;
        var frust;

        if ((nearZ <= 0.0) || (farZ <= 0.0) ||
            (deltaX <= 0.0) || (deltaY <= 0.0) || (deltaZ <= 0.0))
            return this;

        frust = new Matrix4x4();

        frust.elements[0 * 4 + 0] = 2.0 * nearZ / deltaX;
        frust.elements[0 * 4 + 1] = frust.elements[0 * 4 + 2] = frust.elements[0 * 4 + 3] = 0.0;

        frust.elements[1 * 4 + 1] = 2.0 * nearZ / deltaY;
        frust.elements[1 * 4 + 0] = frust.elements[1 * 4 + 2] = frust.elements[1 * 4 + 3] = 0.0;

        frust.elements[2 * 4 + 0] = (right + left) / deltaX;
        frust.elements[2 * 4 + 1] = (top + bottom) / deltaY;
        frust.elements[2 * 4 + 2] = -(nearZ + farZ) / deltaZ;
        frust.elements[2 * 4 + 3] = -1.0;

        frust.elements[3 * 4 + 2] = -2.0 * nearZ * farZ / deltaZ;
        frust.elements[3 * 4 + 0] = frust.elements[3 * 4 + 1] = frust.elements[3 * 4 + 3] = 0.0;

        frust = frust.multiply(this);
        this.elements = frust.elements;

        return this;
    },

    lookAt : function(eye, look, up) {
        var eyeSubLook = { x : eye.x - look.x, y : eye.y - look.y, z : eye.z - look.z};
        var n = SceneJs.utils.Vector3.divide(eyeSubLook, SceneJs.utils.Vector3.len(eyeSubLook));
        var upCrossn = SceneJs.utils.Vector3.cross(up, n);
        var u = SceneJs.utils.Vector3.divide(upCrossn, SceneJs.utils.Vector3.len(upCrossn));
        var v = SceneJs.utils.Vector3.cross(n, u);
        return (new SceneJs.Matrix4x4([
            u.x, u.y, u.z, 0.0,
            v.x, v.y, v.z, 0.0,
            n.x, n.y, n.z, 0.0,
            0.0, 0.0, 0.0, 1.0]))
                .translate(-eye.x, -eye.y, -eye.z);
    },

    perspective: function (fovy, aspect, nearZ, farZ) {
        var frustumH = Math.tan(fovy / 360.0 * Math.PI) * nearZ;
        var frustumW = frustumH * aspect;

        return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
    },

    ortho: function (left, right, bottom, top, nearZ, farZ) {
        var deltaX = right - left;
        var deltaY = top - bottom;
        var deltaZ = farZ - nearZ;

        var ortho = new Matrix4x4();

        if ((deltaX == 0.0) || (deltaY == 0.0) || (deltaZ == 0.0))
            return this;

        ortho.elements[0 * 4 + 0] = 2.0 / deltaX;
        ortho.elements[3 * 4 + 0] = -(right + left) / deltaX;
        ortho.elements[1 * 4 + 1] = 2.0 / deltaY;
        ortho.elements[3 * 4 + 1] = -(top + bottom) / deltaY;
        ortho.elements[2 * 4 + 2] = -2.0 / deltaZ;
        ortho.elements[3 * 4 + 2] = -(nearZ + farZ) / deltaZ;

        ortho = ortho.multiply(this);
        this.elements = ortho.elements;

        return this;
    },

    multiply: function (right) {
        var tmp = new Matrix4x4();

        for (var i = 0; i < 4; i++) {
            tmp.elements[i * 4 + 0] =
            (this.elements[i * 4 + 0] * right.elements[0 * 4 + 0]) +
            (this.elements[i * 4 + 1] * right.elements[1 * 4 + 0]) +
            (this.elements[i * 4 + 2] * right.elements[2 * 4 + 0]) +
            (this.elements[i * 4 + 3] * right.elements[3 * 4 + 0]);

            tmp.elements[i * 4 + 1] =
            (this.elements[i * 4 + 0] * right.elements[0 * 4 + 1]) +
            (this.elements[i * 4 + 1] * right.elements[1 * 4 + 1]) +
            (this.elements[i * 4 + 2] * right.elements[2 * 4 + 1]) +
            (this.elements[i * 4 + 3] * right.elements[3 * 4 + 1]);

            tmp.elements[i * 4 + 2] =
            (this.elements[i * 4 + 0] * right.elements[0 * 4 + 2]) +
            (this.elements[i * 4 + 1] * right.elements[1 * 4 + 2]) +
            (this.elements[i * 4 + 2] * right.elements[2 * 4 + 2]) +
            (this.elements[i * 4 + 3] * right.elements[3 * 4 + 2]);

            tmp.elements[i * 4 + 3] =
            (this.elements[i * 4 + 0] * right.elements[0 * 4 + 3]) +
            (this.elements[i * 4 + 1] * right.elements[1 * 4 + 3]) +
            (this.elements[i * 4 + 2] * right.elements[2 * 4 + 3]) +
            (this.elements[i * 4 + 3] * right.elements[3 * 4 + 3]);
        }

        this.elements = tmp.elements;
        return this;
    },

    loadIdentity: function () {
        for (var i = 0; i < 16; i++)
            this.elements[i] = 0;
        this.elements[0 * 4 + 0] = 1.0;
        this.elements[1 * 4 + 1] = 1.0;
        this.elements[2 * 4 + 2] = 1.0;
        this.elements[3 * 4 + 3] = 1.0;
        return this;
    }
};
