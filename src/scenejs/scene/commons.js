

/** An RGB colour. Each component has a range of [0..255].
 */

SceneJs.Color = function(r, g, b, a) {
    this.r = r || 0.0;
    this.g = g || 0.0;
    this.b = b || 0.0;
    this.a = a || 0.0;
};


/** A 2D double-precision coordinate.
 */
SceneJs.Point2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

SceneJs.Sphere2 = function(center, radius) {
    this.center = center || new SceneJs.Point2();
    this.radius = radius || 1.0;
};

/** A 2D window onto the physical device (eg. canvas).
 */
SceneJs.Volume2 = function(xmin, ymin, xmax, ymax) {
    this.xmin = xmin || 0;
    this.ymin = ymin || 0;
    this.xmax = xmax || 1;
    this.ymax = ymax || 1;
};

/** A 3D homogeneous coordinate.
 */
SceneJs.Point3 = function(x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 1.0;
};

SceneJs.Sphere3 = function(center, radius) {
    this.center = center ? new SceneJs.Point3(center.x, center.y, center.z) : new SceneJs.Point3();
    this.radius = radius || 1.0;
};

/** A 3D view volume.
 */
SceneJs.Volume3 = function(xmin, ymin, zmin, xmax, ymax, zmax) {
    this.xmin = xmin || -1.0;
    this.ymin = ymin || -1.0;
    this.zmin = zmin || -1.0;
    this.xmax = xmax || 1.0;
    this.ymax = ymax || 1.0;
    this.zmax = zmax || 1.0;
};

/** A 3D vector
 *
 */
SceneJs.Vector3 = function(x, y, z) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;

    this.len = function() {
        return Math.sqrt((x * x) + (y * y) + (z * z));
    };

    this.normalize = function() {
        return this.divide(this.len());
    };

    this.subtract = function(v) {
        return new SceneJs.Vector3(x - v.y, y - v.y, z - v.z);
    };

    this.cross = function(v) {
        return new SceneJs.Vector3(y * v.z - z * v.y, z * v.x - x * v.z, x * v.y - y * v.x);
    };

    this.divide = function(divisor) {
        return new SceneJs.Vector3(x / divisor, y / divisor, z / divisor);
    };

    this.scale = function(scalar) {
        return new SceneJs.Vector3(x * scalar, y * scalar, z * scalar);
    };

    this.dot = function(v) {
        return (x * v.x) + (y * v.y) + (z * v.z);
    };
};

/** Subtracts 3D vector b from a
 *
 */
SceneJs.Vector3.subtract = function(a, b) {
    return new SceneJs.Vector3(a.x - b.y, a.y - b.y, a.z - b.z);
};

/** Returns the cross-product of two 3D vectors
 *
 */
SceneJs.Vector3.cross = function(a, b) {
    return new SceneJs.Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x
            * b.y - a.y * b.x);
};


/**
 * Returns the length of a 3D vector
 */
SceneJs.Vector3.len = function(a) {
    return Math.sqrt((a.x * a.x) + (a.y * a.y) + (a.z * a.z));
};


/** Divides a 3D vector by a divisor
 */
SceneJs.Vector3.divide = function(a, divisor) {
    return new SceneJs.Vector3(a.x / divisor, a.y / divisor, a.z / divisor);
};


/** Scales a 3D vector by a scalar
 */
SceneJs.Vector3.scale = function(a, scalar) {
    return new SceneJs.Vector3(a.x * scalar, a.y * scalar, a.z * scalar);
};

/** Normalises a 3D vector
 */
SceneJs.Vector3.normalize = function(a) {
    return SceneJs.Vector3.divide(a, this.len(a));
};

/** Returns the dot product of two 3D vectors
 */
SceneJs.Vector3.dot = function(a, b) {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
};

/** A face, which is an array of indexes into some other coordinate array.
 */
SceneJs.Face = function(verts) {
    this.verts = (verts) ? verts : new Array();
};


/** A 4x4 matrix with methods for encoding transformations. It also has methods to transform
 * 3D coordinates and vectors, which applies transformations in the order that they were encoded.
 */
SceneJs.Matrix4 = function() {
    this.e = [
        [ 1.0,0.0,0.0,0.0],
        [ 0.0,1.0,0.0,0.0],
        [ 0.0,0.0,1.0,0.0],
        [ 0.0,0.0,0.0,1.0]
    ];

    /** Sets the matrix to it's identity, effectively clearing transformation from it.
     */
    this.identity = function() {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                this.e[i][j] = (i == j) ? 1.0 : 0.0;
            }
        }
        return this;
    };

    /** Post-concatenates an X-axis rotation to the matrix.
     *
     * @param a Angle in degrees, automatically wrapped to range.
     */
    this.rotateX = function(a) {
        var t;
        var r = this.degToRad(this.wrapAngle(a));
        var c = Math.cos(r);
        var s = Math.sin(r);
        for (var i = 0; i < 4; i++) {
            t = this.e[i][1];
            this.e[i][1] = t * c - this.e[i][2] * s;
            this.e[i][2] = t * s + this.e[i][2] * c;
        }
        return this;
    };

    /** Post-concatenates a Y-axis rotation to the matrix.
     *
     * @param a Angle in degrees, automatically wrapped to range.
     */
    this.rotateY = function(a) {
        var t;
        var r = this.degToRad(this.wrapAngle(a));
        var c = Math.cos(r);
        var s = Math.sin(r);
        for (var i = 0; i < 4; i++) {
            t = this.e[i][0];
            this.e[i][0] = t * c + this.e[i][2] * s;
            this.e[i][2] = this.e[i][2] * c - t * s;
        }
        return this;
    };

    /** Post-concatenates an Z-axis rotation to the matrix.
     *
     * @param a Angle in degrees, automatically wrapped to range.
     */
    this.rotateZ = function(a) {
        var t;
        var r = this.degToRad(this.wrapAngle(a));
        var c = Math.cos(r);
        var s = Math.sin(r);
        for (var i = 0; i < 4; i++) {
            t = this.e[i][0];
            this.e[i][0] = t * c - this.e[i][1] * s;
            this.e[i][1] = t * s + this.e[i][1] * c;
        }
        return this;
    };

    /** Post-concatenates an X,Y and Z axis translation to the matrix.
     *
     * @param x X-axis translation amount
     * @param y Y-axis translation amount
     * @param z Z-axis translation amount
     */
    this.translate = function(tx, ty, tz) {
        for (var i = 0; i < 4; i++) {
            this.e[i][0] += this.e[i][3] * tx;
            this.e[i][1] += this.e[i][3] * ty;
            this.e[i][2] += this.e[i][3] * tz;
        }
        return this;
    };

    /** Post-concatenates an X,Y and Z axis scaling transformation to the matrix.
     *
     * @param x X-axis scaling amount
     * @param y Y-axis scaling amount
     * @param z Z-axis scaling amount
     */
    this.scale = function(sx, sy, sz) {
        for (var i = 0; i < 4; i++) {
            this.e[i][0] *= sx;
            this.e[i][1] *= sy;
            this.e[i][2] *= sz;
        }
        return this;
    };

    /** Post-concatenates a Z-axis perspecive projection transformation to the matrix.
     *
     * @param d Distance from the viewpoint to the projection plane.
     */
    this.perspective = function(d) {
        var f = 1.0 / d;
        for (var i = 0; i < 4; i++) {
            this.e[i][3] += this.e[i][2] * f;
        }
        return this;
    };

    var perspectiveVolume = function(fovy, aspect, znear, zfar) {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;
        this.frustum(xmin, xmax, ymin, ymax, znear, zfar);
        return this;
    };

    /** Encodes a view transformation to the matrix. This wipes out anything already encoded/concatenated into the
     * matrix.
     *
     * @param eye Position of the viewer's eye
     * @param look Vector along which the viewer is looking.
     * @param up Vector pointing upwards. Typically this starts off at {0.0, 1.0, 0.0}.
     */
    this.lookAt = function(eye, look, up) {
        eye = new SceneJs.Vector3(eye.x, eye.y, eye.z);
        look = new SceneJs.Vector3(look.x, look.y, look.z);
        up = new SceneJs.Vector3(up.x, up.y, up.z);
        var n = eye.subtract(look).normalize();
        var u = up.cross(n).normalize();
        var v = n.cross(u).normalize();
        this.e[0][0] = u.x; // u
        this.e[0][1] = u.y;
        this.e[0][2] = u.z;
        this.e[0][3] = 0.0;
        this.e[1][0] = v.x; // v
        this.e[1][1] = v.y;
        this.e[1][2] = v.z;
        this.e[1][3] = 0.0;
        this.e[2][0] = n.x; // n
        this.e[2][1] = n.y;
        this.e[2][2] = n.z;
        this.e[2][3] = 0.0;
        this.e[3][0] = 0.0;
        this.e[3][1] = 0.0;
        this.e[3][2] = 0.0;
        this.e[3][3] = 1.0;
        this.translate(-eye.x, -eye.y, -eye.z);
        return this;
    };

    this.ortho = function(left, right,
                          bottom, top,
                          znear, zfar) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(zfar + znear) / (zfar - znear);
        this.e = [
            [2 / (right - left), 0, 0, tx],
            [0, 2 / (top - bottom), 0, ty],
            [0, 0, -2 / (zfar - znear), tz],
            [0, 0, 0, 1]
        ];
        return this;
    };


    this.frustum = function(left, right,
                            bottom, top,
                            znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);
        this.e = [
            [X, 0, A, 0],
            [0, Y, B, 0],
            [0, 0, C, D],
            [0, 0, -1, 0]
        ];
        return this;
    };

    /** Transforms a 3D coordinate by this matrix.
     *
     * @param p  The 3D coordinate, which is modified by the transformation.
     * @param q Optional result coordinate, created if not supplied.
     */
    this.transformPoint3 = function(p, q) {
        if (!q) {
            q = new SceneJs.Point3();
        }
        q.x = (this.e[0][0] * p.x) + (this.e[1][0] * p.y) + (this.e[2][0] * p.z) + this.e[3][0];
        q.y = (this.e[0][1] * p.x) + (this.e[1][1] * p.y) + (this.e[2][1] * p.z) + this.e[3][1];
        q.z = (this.e[0][2] * p.x) + (this.e[1][2] * p.y) + (this.e[2][2] * p.z) + this.e[3][2];
        q.w = (this.e[0][3] * p.x) + (this.e[1][3] * p.y) + (this.e[2][3] * p.z) + this.e[3][3];
        return q;
    };

    /** Transforms a 3D vector by this matrix.
     *
     * @param p  The 3D vector, which is modified by the transformation.
     */
    this.transformVector3 = function(v) {
        return new SceneJs.Vector3((this.e[0][0] * v.x) + (this.e[1][0] * v.y) + (this.e[2][0] * v.z),
                (this.e[0][1] * v.x) + (this.e[1][1] * v.y) + (this.e[2][1] * v.z),
                (this.e[0][2] * v.x) + (this.e[1][2] * v.y) + (this.e[2][2] * v.z));
    };

    this.degToRad = function(a) {
        return  a * 0.0174532925;
    };

    this.wrapAngle = function(a) {
        return (a < 0.0) ? (360.0 - (Math.abs(a) % 360.0)) : (a > 360.0) ? (a % 360) : a;
    };

    this.multiply = function(m) {
        var r = new SceneJs.Matrix4();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                for (var k = 0; k < 4; k++) {
                    r.e[i][j] += this.e[i][k] * m.e[k][j];
                }
            }
        }
        return r;
    };

    this.flatten = function () {
        var result = [];
        for (var j = 0; j < 4; j++) {
            for (var i = 0; i < 4; i++) {
                result.push(this.e[i][j]);
            }
        }
        return result;
    };
};


