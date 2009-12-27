/** Optimised vector and matrix utilities
 *
 */

/** A 3D vector
 *
 */
SceneJs.utils.Vector3 = function(x, y, z) {
    this.x = x ? x : 0;
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
    return new SceneJs.utils.Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
};

/**
 * Returns the length of a 3D vector
 */
SceneJs.utils.Vector3.len = function(a) {
    return Math.sqrt((a.x * a.x) + (a.y * a.y) + (a.z * a.z));
};

/** Divides a 3D vector by a divisor
 */
SceneJs.utils.Vector3.divide = function(a, divisor) {
    return new SceneJs.utils.Vector3(a.x / divisor, a.y / divisor, a.z / divisor);
};

/** Scales a 3D vector by a scalar
 */
SceneJs.utils.Vector3.scale = function(a, scalar) {
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

SceneJs.utils.Matrix4 = function(e) {

    this.elements = e || [
        1.0,0.0,0.0,0.0,
        0.0,1.0,0.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0];

    this.multiply = function (a) {
        var c = new SceneJs.utils.Matrix4();
        for (var i = 0; i < 16; i += 4) {
            c.elements[i + 0] = this.elements[i] * a.elements[0] +
                                this.elements[i + 1] * a.elements[4] +
                                this.elements[i + 2] * a.elements[8] +
                                this.elements[i + 3] * a.elements[12];
            c.elements[i + 1] = this.elements[i] * a.elements[1] +
                                this.elements[i + 1] * a.elements[5] +
                                this.elements[i + 2] * a.elements[9] +
                                this.elements[i + 3] * a.elements[13];
            c.elements[i + 2] = this.elements[i] * a.elements[2] +
                                this.elements[i + 1] * a.elements[6] +
                                this.elements[i + 2] * a.elements[10] +
                                this.elements[i + 3] * a.elements[14];
            c.elements[i + 3] = this.elements[i] * a.elements[3] +
                                this.elements[i + 1] * a.elements[7] +
                                this.elements[i + 2] * a.elements[11] +
                                this.elements[i + 3] * a.elements[15];
        }
        return c;
    };

    this.transformPoint3 = function(p) {
        return {
            x : (this.elements[0] * p.x) + (this.elements[4] * p.y) + (this.elements[8] * p.z) + this.elements[12],
            y : (this.elements[1] * p.x) + (this.elements[5] * p.y) + (this.elements[9] * p.z) + this.elements[13],
            z : (this.elements[2] * p.x) + (this.elements[6] * p.y) + (this.elements[10] * p.z) + this.elements[14],
            w : (this.elements[3] * p.x) + (this.elements[7] * p.y) + (this.elements[11] * p.z) + this.elements[15]
        };
    };

    this.transformVector3 = function(v) {
        return {
            x:(this.elements[0] * v.x) + (this.elements[4] * v.y) + (this.elements[8] * v.z),
            y:(this.elements[1] * v.x) + (this.elements[5] * v.y) + (this.elements[9] * v.z),
            z:(this.elements[2] * v.x) + (this.elements[6] * v.y) + (this.elements[10] * v.z)
        };
    };

    this.getAsArray = function() {
        return this.elements;
    };

    this.getAsWebGLFloatArray = function() {
        return new WebGLFloatArray(this.getAsArray());
    };
};

/** Returns a fresh scaling matrix
 *
 * @param sx X-axis scaling amount
 * @param sy Y-axis scaling amount
 * @param sz Z-axis scaling amount
 */
SceneJs.utils.Matrix4.createScale = function(sx, sy, sz) {
    return new SceneJs.utils.Matrix4([
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    ]);
};

/** Returns a fresh translation matrix
 *
 * @param tx X-axis translation amount
 * @param ty Y-axis translation amount
 * @param tz Z-axis translation amount
 */
SceneJs.utils.Matrix4.createTranslation = function(tx, ty, tz) {
    return new SceneJs.utils.Matrix4([
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1
    ]);
};

/** Returns a fresh rotation matrix
 *
 * @param angle Angle of rotation in degrees
 * @param x
 * @param y
 * @param z
 */
SceneJs.utils.Matrix4.createRotate = function (angle, x, y, z) {
    angle *= 0.0174532925; // Convert to radians
    var mag = Math.sqrt(x * x + y * y + z * z);
    var sinAngle = Math.sin(angle);
    var cosAngle = Math.cos(angle);

    if (mag > 0) {
        var xx, yy, zz, xy, yz, zx, xs, ys, zs;
        var oneMinusCos;

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

        return new SceneJs.utils.Matrix4([
            (oneMinusCos * xx) + cosAngle, (oneMinusCos * xy) - zs, (oneMinusCos * zx) + ys, 0.0,
            (oneMinusCos * xy) + zs, (oneMinusCos * yy) + cosAngle, (oneMinusCos * yz) - xs,  0.0,
            (oneMinusCos * zx) - ys, (oneMinusCos * yz) + xs, (oneMinusCos * zz) + cosAngle, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
    } else {
        return new SceneJs.utils.Matrix4();
    }
};

/** Encodes a view transformation to the matrix. This wipes out anything already encoded/concatenated into the
 * matrix.
 *
 * @param eye Position of the viewer's eye
 * @param look Vector along which the viewer is looking.
 * @param up Vector pointing upwards. Typically this starts off at {0.0, 1.0, 0.0}.
 */
SceneJs.utils.Matrix4.createLookAt = function(eye, look, up) {
    var eyeSubLook = { x : eye.x - look.x, y : eye.y - look.y, z : eye.z - look.z};
    var n = SceneJs.utils.Vector3.divide(eyeSubLook, SceneJs.utils.Vector3.len(eyeSubLook));
    var upCrossn = SceneJs.utils.Vector3.cross(up, n);
    var u = SceneJs.utils.Vector3.divide(upCrossn, SceneJs.utils.Vector3.len(upCrossn));
    var v = SceneJs.utils.Vector3.cross(n, u);
    return SceneJs.utils.Matrix4
            .createTranslation(-eye.x, -eye.y, -eye.z)
            .multiply(new SceneJs.utils.Matrix4([
        u.x, u.y, u.z, 0.0,
        v.x, v.y, v.z, 0.0,
        n.x, n.y, n.z, 0.0,
        0.0, 0.0, 0.0, 1.0]));
};
//
//var makeLookAt = function(_eye,
//                            _look,
//                            _up) {
//      var eye = $V([_eye.x, _eye.y, _eye.z]);
//      var center = $V([_look.x, _look.y, _look.z]);
//      var up = $V([_up.x, _up.y, _up.z]);
//      var z = eye.subtract(center).toUnitVector();
//      var x = up.cross(z).toUnitVector();
//      var y = z.cross(x).toUnitVector();
//      var m = $M([
//          [x.e(1), x.e(2), x.e(3), 0],
//          [y.e(1), y.e(2), y.e(3), 0],
//          [z.e(1), z.e(2), z.e(3), 0],
//          [0, 0, 0, 1]
//      ]);
//      var t = $M([
//          [1, 0, 0, -_eye.x],
//          [0, 1, 0, -_eye.y],
//          [0, 0, 1, -_eye.z],
//          [0, 0, 0, 1]
//      ]);
//      return m.x(t);
//  };


SceneJs.utils.Matrix4.createFrustum = function(left, right,
                                               bottom, top,
                                               znear, zfar) {
    var X = 2 * znear / (right - left);
    var Y = 2 * znear / (top - bottom);
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(zfar + znear) / (zfar - znear);
    var D = -2 * zfar * znear / (zfar - znear);
    return new SceneJs.utils.Matrix4([
        X, 0, A, 0,
        0, Y, B, 0,
        0, 0, C, D,
        0, 0, -1, 0
    ]);
};

SceneJs.utils.Matrix4.createOrtho = function(left, right,
                                             bottom, top,
                                             znear, zfar) {
    var tx = -(right + left) / (right - left);
    var ty = -(top + bottom) / (top - bottom);
    var tz = -(zfar + znear) / (zfar - znear);
    return new SceneJs.utils.Matrix4([
        2 / (right - left), 0, 0, tx,
        0, 2 / (top - bottom), 0, ty,
        0, 0, -2 / (zfar - znear), tz,
        0, 0, 0, 1]);
};

SceneJs.utils.Matrix4.createPerspective = function(fovy, aspect, zNear, zFar) {
    var top = Math.tan(fovy * Math.PI / 360) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    return SceneJs.utils.Matrix4.createFrustum(left, right, bottom, top, zNear, zFar);
}

