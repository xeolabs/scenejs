/** Private math utilities.
 */
SceneJS._math = {
    negateVector4: function(v) {
        return [-v[0],-v[1],-v[2],-v[3]];
    },

    addVec4: function (u, v) {
        return [u[0] + v[0],u[1] + v[1],u[2] + v[2],u[3] + v[3]];
    },

    addVec4s: function (v, s) {
        return [v[0] + s,v[1] + s,v[2] + s,v[3] + s];
    },

    addScalarVec4: function(s, v) {
        return SceneJS._math.addVec4s(v, s)
    },

    subVec4: function(u, v) {
        return [u[0] - v[0],u[1] - v[1],u[2] - v[2],u[3] - v[3]];
    },

    subVec4Scalar: function(v, s) {
        return [v[0] - s,v[1] - s,v[2] - s,v[3] - s];
    },

    subScalarVec4: function(v, s) {
        return [s - v[0],s - v[1],s - v[2],s - v[3]];
    },

    mulVec4: function(u, v) {
        return [u[0] * v[0],u[1] * v[1],u[2] * v[2],u[3] * v[3]];
    },

    mulVec4Scalar:function(v, s) {
        return [v[0] * s,v[1] * s,v[2] * s,v[3] * s];
    },

    divVec4:function(u, v) {
        return [u[0] / v[0],u[1] / v[1],u[2] / v[2],u[3] / v[3]];
    },

    divVec4s:function(v, s) {
        return [v[0] / s,v[1] / s,v[2] / s,v[3] / s];
    },

    divScalarVec4:function(s, v) {
        return [s / v[0],s / v[1],s / v[2],s / v[3]];
    },

    dotVector4:function(u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
    },

    cross3Vec4:function(u, v) {
        return [u[1] * v[2] - u[2] * v[1],u[2] * v[0] - u[0] * v[2],u[0] * v[1] - u[1] * v[0],0.0];
    },

    sqLenVec4:function(v) {
        return SceneJS._math.dotVector4(v, v);
    },

    lenVec4:function(v) {
        return Math.sqrt(SceneJS._math.sqLenVec4(v));
    },

    normalizeVec4:function(v) {
        var f = 1.0 / SceneJS._math.lenVec4(v);
        return SceneJS._math.mulVec4Scalar(v, f);
    },

    mat4:function() {
        return new Array(16);
    },

    dupMat4:function(m) {
        return m.slice(0, 16);
    },

    getCellMat4:function(m, row, col) {
        return m[row + col * 4];
    },

    setCellMat4:function(m, row, col, s) {
        m[row + col * 4] = s;
    },

    getRowMat4:function(m, r) {
        return [m[r + 0], m[r + 4], m[r + 8], m[r + 12]];
    },

    setRowMat4:function(m, r, v) {
        m[r + 0] = v[0];
        m[r + 4] = v[1];
        m[r + 8] = v[2];
        m[r + 12] = v[3];
    },

    setRowMat4c:function(m, r, x, y, z, w) {
        SceneJS._math.setRowMat4(m, r, [x,y,z,w]);
    },

    setRowMat4s:function(m, r, s) {
        SceneJS._math.setRowMat4c(m, r, s, s, s, s);
    },

    getColMat4:function(m, c) {
        var i = c * 4;
        return [m[i + 0], m[i + 1],m[i + 2],m[i + 3]];
    },

    setColMat4v:function(m, c, v) {
        var i = c * 4;
        m[i + 0] = v[0];
        m[i + 1] = v[1];
        m[i + 2] = v[2];
        m[i + 3] = v[3];
    },

    setColMat4c:function(m, c, x, y, z, w) {
        SceneJS._math.setColMat4v(m, c, [x,y,z,w]);
    },

    setColMat4Scalar:function(m, c, s) {
        SceneJS._math.setColMat4c(m, c, s, s, s, s);
    },

    mat4To3:function(m) {
        return [
            m[0],m[1],m[2],
            m[4],m[5],m[6],
            m[8],m[9],m[10]
        ];
    },

    m4s:function(s) {
        return [
            s,s,s,s,
            s,s,s,s,
            s,s,s,s,
            s,s,s,s
        ];
    },

    setMat4ToZeroes:function() {
        return SceneJS._math.m4s(0.0);
    },

    setMat4ToOnes:function() {
        return SceneJS._math.m4s(1.0);
    },

    diagonalMat4v:function(v) {
        return [
            v[0], 0.0, 0.0, 0.0,
            0.0,v[1], 0.0, 0.0,
            0.0, 0.0, v[2],0.0,
            0.0, 0.0, 0.0, v[3]
        ];
    },

    diagonalMat4c:function(x, y, z, w) {
        return SceneJS._math.diagonalMat4v([x,y,z,w]);
    },

    diagonalMat4s:function(s) {
        return SceneJS._math.diagonalMat4c(s, s, s, s);
    },

    identityMat4:function() {
        return SceneJS._math.diagonalMat4s(1.0);
    },

    isIdentityMat4:function(m) {
        var i = 0;
        var j = 0;
        var s = 0.0;
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                s = m[i + j * 4];
                if ((i == j)) {
                    if (s != 1.0) {
                        return false;
                    }
                }
                else {
                    if (s != 0.0) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    negateMat4:function(m) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = -m[i];
        }
        return r;
    },

    addMat4:function(a, b) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] + b[i];
        }
        return r;
    },

    addMat4Scalar:function(m, s) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] + s;
        }
        return r;
    },

    addScalarMat4:function(s, m) {
        return SceneJS._math.addMat4Scalar(m, s);
    },

    subMat4:function(a, b) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] - b[i];
        }
        return r;
    },

    subMat4Scalar:function(m, s) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] - s;
        }
        return r;
    },

    subScalarMat4:function(s, m) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = s - m[i];
        }
        return r;
    },

    mulMat4:function(a, b) {
        var r = new SceneJS._math.mat4();
        var i = 0;
        var j = 0;
        var k = 0;
        var s = 0.0;
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                s = 0.0;
                for (k = 0; k < 4; ++k) {
                    s += a[i + k * 4] * b[k + j * 4];
                }
                r[i + j * 4] = s;
            }
        }
        return r;
    },

    mulMat4s:function(m, s)
    {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] * s;
        }
        return r;
    },

    mulMat4v4:function(m, v) {
        return [
            m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
            m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
        ];
    },

    transposeMat4:function(m) {
        var r = new SceneJS._math.mat4();
        var i = 0;
        var j = 0;
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                r[i + j * 4] = m[i * 4 + j];
            }
        }
        return r;
    },

    determinantMat4:function(m) {
        var f = SceneJS._math.getCellMat4;
        return (
                f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) +
                f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) +
                f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) +
                f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) +
                f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) +
                f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3)
                );
    },

    inverseMat4:function(m) {
        var t = new SceneJS._math.mat4();

        var f = SceneJS._math.getCellMat4;

        t[0] = f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) - f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) + f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3);
        t[1] = f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) + f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) + f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) - f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3);
        t[2] = f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) + f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) - f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3);
        t[3] = f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2);

        t[4] = f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 3);
        t[5] = f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 3);
        t[6] = f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 3);
        t[7] = f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 0) + f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 2);

        t[8] = f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 3);
        t[9] = f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 3);
        t[10] = f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 3);
        t[11] = f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 2);

        t[12] = f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) + f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3);
        t[13] = f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3);
        t[14] = f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3);
        t[15] = f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) + f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2);

        var s = 1.0 / SceneJS._math.determinantMat4(m);
        return SceneJS._math.mulMat4s(t, s);
    },

    traceMat4:function(m) {
        return (m[0] + m[5] + m[10] + m[15]);
    },

    translationMat4v:function(v) {
        var m = SceneJS._math.identityMat4();
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return m;
    },

    translationMat4c:function(x, y, z) {
        return SceneJS._math.translationMat4v([x,y,z]);
    },

    translationMat4s:function(s) {
        return SceneJS._math.translationMat4c(s, s, s);
    },

    rotationMat4v:function(anglerad, axis) {
        var ax = SceneJS._math.normalizeVec4([axis[0],axis[1],axis[2],0.0]);
        var s = Math.sin(anglerad);
        var c = Math.cos(anglerad);
        var q = 1.0 - c;

        var x = ax[0];
        var y = ax[1];
        var z = ax[2];

        var xx,yy,zz,xy,yz,zx,xs,ys,zs;

        xx = x * x;
        yy = y * y;
        zz = z * z;
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;

        var m = new SceneJS._math.mat4();

        m[0] = (q * xx) + c;
        m[1] = (q * xy) + zs;
        m[2] = (q * zx) - ys;
        m[3] = 0.0;

        m[4] = (q * xy) - zs;
        m[5] = (q * yy) + c;
        m[6] = (q * yz) + xs;
        m[7] = 0.0;

        m[8] = (q * zx) + ys;
        m[9] = (q * yz) - xs;
        m[10] = (q * zz) + c;
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    },

    rotationMat4c:function(anglerad, x, y, z) {
        return SceneJS._math.rotationMat4v(anglerad, [x,y,z]);
    },

    scalingMat4v:function(v) {
        var m = SceneJS._math.identityMat4();
        m[0] = v[0];
        m[5] = v[1];
        m[10] = v[2];
        return m;
    },

    scalingMat4c:function(x, y, z) {
        return SceneJS._math.scalingMat4v([x,y,z]);
    },

    scalingMat4s:function(s) {
        return SceneJS._math.scalingMat4c(s, s, s);
    },

    lookAtMat4v:function(pos, target, up) {
        var pos4 = [pos[0],pos[1],pos[2],0.0];
        var target4 = [target[0],target[1],target[2],0.0];
        var up4 = [up[0],up[1],up[2],0.0];

        var v = SceneJS._math.normalizeVec4(SceneJS._math.subVec4(target4, pos4));
        var u = SceneJS._math.normalizeVec4(up4);
        var s = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(v, u));

        u = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(s, v));

        var m = new SceneJS._math.mat4();

        m[0] = s[0];
        m[1] = u[0];
        m[2] = -v[0];
        m[3] = 0.0;

        m[4] = s[1];
        m[5] = u[1];
        m[6] = -v[1];
        m[7] = 0.0;

        m[8] = s[2];
        m[9] = u[2];
        m[10] = -v[2];
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        m = SceneJS._math.mulMat4(m, SceneJS._math.translationMat4v(SceneJS._math.negateVector4(pos4)));

        return m;
    },

    lookAtMat4c:function(posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
        return SceneJS._math.lookAtMat4v([posx,posy,posz], [targetx,targety,targetz], [upx,upy,upz]);
    },

    orthoMat4v:function(omin, omax) {
        var omin4 = [omin[0],omin[1],omin[2],0.0];
        var omax4 = [omax[0],omax[1],omax[2],0.0];
        var vsum = SceneJS._math.addVec4(omax4, omin4);
        var vdif = SceneJS._math.subVec4(omax4, omin4);

        var m = new SceneJS._math.mat4();

        m[0] = 2.0 / vdif[0];
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = 2.0 / vdif[1];
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = 0.0;
        m[9] = 0.0;
        m[10] = -2.0 / vdif[2];
        m[11] = 0.0;

        m[12] = -vsum[0] / vdif[0];
        m[13] = -vsum[1] / vdif[1];
        m[14] = -vsum[2] / vdif[2];
        m[15] = 1.0;

        return m;
    },

    orthoMat4c:function(left, right, bottom, top, znear, zfar) {
        return SceneJS._math.orthoMat4v([left,bottom,znear], [right,top,zfar]);
    },

    frustumMat4v:function(fmin, fmax) {
        var fmin4 = [fmin[0],fmin[1],fmin[2],0.0];
        var fmax4 = [fmax[0],fmax[1],fmax[2],0.0];
        var vsum = SceneJS._math.addVec4(fmax4, fmin4);
        var vdif = SceneJS._math.subVec4(fmax4, fmin4);
        var t = 2.0 * fmin4[2];

        var m = new SceneJS._math.mat4();

        m[0] = t / vdif[0];
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif[1];
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif[0];
        m[9] = vsum[1] / vdif[1];
        m[10] = -vsum[2] / vdif[2];
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif[2];
        m[15] = 0.0;

        return m;
    },

    frustumMatrix4:function(left, right, bottom, top, znear, zfar) {
        var fmin4 = [left,right,bottom,0.0];
        var fmax4 = [top,znear,zfar,0.0];
        var vsum = SceneJS._math.addVec4(fmax4, fmin4);
        var vdif = SceneJS._math.subVec4(fmax4, fmin4);
        var t = 2.0 * fmin4[2];

        var m = new SceneJS._math.mat4();

        m[0] = t / vdif[0];
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif[1];
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif[0];
        m[9] = vsum[1] / vdif[1];
        m[10] = -vsum[2] / vdif[2];
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif[2];
        m[15] = 0.0;

        return m;
    },

    perspectiveMatrix4:function(fovyrad, aspectratio, znear, zfar) {
        var pmin = new Array(4);
        var pmax = new Array(4);

        pmin[2] = znear;
        pmax[2] = zfar;

        pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
        pmin[1] = -pmax[1];

        pmax[0] = pmax[1] * aspectratio;
        pmin[0] = -pmax[0];

        return SceneJS._math.frustumMat4v(pmin, pmax);
    },

    //    transformPoint3:function(m, p) {
    //        return {
    //            x : (m[0] * p.x) + (m[4] * p.y) + (m[8] * p.z) + m[12],
    //            y : (m[1] * p.x) + (m[5] * p.y) + (m[9] * p.z) + m[13],
    //            z : (m[2] * p.x) + (m[6] * p.y) + (m[10] * p.z) + m[14],
    //            w : (m[3] * p.x) + (m[7] * p.y) + (m[11] * p.z) + m[15]
    //        };
    //    },
    //
    transformPoint3:function(m, p) {
        return [
            (m[0] * p[0]) + (m[4] * p[1]) + (m[8] * p[2]) + m[12],
            (m[1] * p[0]) + (m[5] * p[1]) + (m[9] * p[2]) + m[13],
            (m[2] * p[0]) + (m[6] * p[1]) + (m[10] * p[2]) + m[14],
            (m[3] * p[0]) + (m[7] * p[1]) + (m[11] * p[2]) + m[15]
        ];
    },


    //    transformVector3:function(m, v) {
    //        return {
    //            x: (m[0] * v.x) + (m[4] * v.y) + (m[8] * v.z),
    //            y: (m[1] * v.x) + (m[5] * v.y) + (m[9] * v.z),
    //            z: (m[2] * v.x) + (m[6] * v.y) + (m[10] * v.z)
    //        };
    //    },

    transformVector3:function(m, v) {
        return [
            (m[0] * v[0]) + (m[4] * v[1]) + (m[8] * v[2]),
            (m[1] * v[0]) + (m[5] * v[1]) + (m[9] * v[2]),
            (m[2] * v[0]) + (m[6] * v[1]) + (m[10] * v[3])
        ];
    },

    Plane3 : function(normal, offset, normalize) {
        this.normal = [0.0, 0.0, 1.0 ];
        this.offset = 0.0;
        if (normal && offset) {
            this.normal[0] = normal[0];
            this.normal[1] = normal[1];
            this.normal[2] = normal[2];
            this.offset = offset;

            if (normalize) {
                var s = Math.sqrt(
                        this.normal[0] * this.normal[0] +
                        this.normal[1] * this.normal[1] +
                        this.normal[2] * this.normal[2]
                        );
                if (s > 0.0) {
                    s = 1.0 / s;
                    this.normal[0] *= s;
                    this.normal[1] *= s;
                    this.normal[2] *= s;
                    this.offset *= s;
                }
            }
        }
    },

    MAX_DOUBLE: 1000000000000.0,
    MIN_DOUBLE: -1000000000000.0,

    Box3: function(min, max) {
        this.min = min || [ SceneJS._math.MAX_DOUBLE,SceneJS._math.MAX_DOUBLE,SceneJS._math.MAX_DOUBLE ];
        this.max = max || [ SceneJS._math.MIN_DOUBLE,SceneJS._math.MIN_DOUBLE,SceneJS._math.MIN_DOUBLE ];

        this.init = function(min, max) {
            for (var i = 0; i < 3; ++i) {
                this.min[i] = min[i];
                this.max[i] = max[i];
            }
            return this;
        };

        this.fromPoints = function(points) {
            var points2 = [];
            for (var i = 0; i < points.length; i++) {
                points2.push([points[i][0] / points[i][3], points[i][1] / points[i][3], points[i][2] / points[i][3]]);
            }
            points = points2;
            for (var i = 0; i < points.length; i++) {
                var v = points[i];
                for (var j = 0; j < 3; j++) {
                    if (v[j] < this.min[j]) {
                        this.min[j] = v[j];
                    }
                    if (v[j] > this.max[j]) {
                        this.max[j] = v[j];
                    }
                }
            }
            return this;
        };

        this.isEmpty = function() {
            return (
                    (this.min[0] >= this.max[0])
                            && (this.min[1] >= this.max[1])
                            && (this.min[2] >= this.max[2])
                    );
        };

        this.getCenter = function() {
            return [
                (this.max[0] + this.min[0]) / 2.0,
                (this.max[1] + this.min[1]) / 2.0,
                (this.max[2] + this.min[2]) / 2.0
            ];
        };

        this.getSize = function() {
            return [
                (this.max[0] - this.min[0]),
                (this.max[1] - this.min[1]),
                (this.max[2] - this.min[2])
            ];
        };

        this.getFacesAreas = function() {
            var s = this.size;
            return [
                (s[1] * s[2]),
                (s[0] * s[2]),
                (s[0] * s[1])
            ];
        };

        this.getSurfaceArea = function() {
            var a = this.getFacesAreas();
            return ((a[0] + a[1] + a[2]) * 2.0);
        };

        this.getVolume = function() {
            var s = this.size;
            return (s[0] * s[1] * s[2]);
        };

        this.getOffset = function(half_delta) {
            for (var i = 0; i < 3; ++i) {
                this.min[i] -= half_delta;
                this.max[i] += half_delta;
            }
            return this;
        };
    },

    AxisBox3 : function(min, max) {
        this.verts = [
            [min[0], min[1], min[2]],
            [max[0], min[1], min[2]],
            [max[0], max[1], min[2]],
            [min[0], max[1], min[2]],

            [min[0], min[1], max[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], max[2]],
            [min[0], max[1], max[2]]
        ];

        this.toBox3 = function() {
            var box = new SceneJS._math.Box3();
            for (var i = 0; i < 8; i++) {
                var v = this.verts[i];
                for (var j = 0; j < 3; j++) {
                    if (v[j] < box.min[j]) {
                        box.min[j] = v[j];
                    }
                    if (v[j] > box.max[j]) {
                        box.max[j] = v[j];
                    }
                }
            }
        };
    },

    Sphere3 : function(center, radius) {
        this.center = [ 0.0, 0.0, 0.0 ];
        this.radius = -1.0;

        this.init = function(center, radius) {
            this.center[0] = center[0];
            this.center[1] = center[1];
            this.center[2] = center[2];
            this.radius = radius;
            return this;
        };

        if (center && radius) {
            this.init(center, radius);
        }

        this.isEmpty = function() {
            return (this.radius == 0.0);
        };

        this.surfaceArea = function() {
            return (4.0 * Math.PI * this.radius * this.radius);
        };

        this.getVolume = function() {
            return ((4.0 / 3.0) * Math.PI * this.radius * this.radius * this.radius);
        };
    }
    ,

    FrustumPlane: function () {
        this.normal = [ 0.0, 0.0, 1.0 ];
        this.offset = 0.0;
        this.testVertex = [ 0, 0, 0 ];

        this.init = function(nx, ny, nz, off) {
            var s = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);

            this.normal[0] = nx * s;
            this.normal[1] = ny * s;
            this.normal[2] = nz * s;

            this.offset = off * s;

            this.testVertex[0] = (this.normal[0] >= 0.0) ? (1) : (0);
            this.testVertex[1] = (this.normal[1] >= 0.0) ? (1) : (0);
            this.testVertex[2] = (this.normal[2] >= 0.0) ? (1) : (0);
        };
    },

    OUTSIDE_FRUSTUM : 0,
    INTERSECT_FRUSTUM : 1,
    INSIDE_FRUSTUM : 2,

    Frustum : function(mat) {
        this.planes = new Array(6);
        for (var i = 0; i < 6; ++i) {
            this.planes[i] = new SceneJS._math.FrustumPlane();
        }

        this.init = function (mat) {
            this.mat = mat.slice(0, 16);

            var m = this.mat;
            var q = [ m[3], m[7], m[11] ];

            this.planes[0].init(q[ 0] - m[ 0], q[ 1] - m[ 4], q[ 2] - m[ 8], m[15] - m[12]);
            this.planes[1].init(q[ 0] + m[ 0], q[ 1] + m[ 4], q[ 2] + m[ 8], m[15] + m[12]);
            this.planes[2].init(q[ 0] - m[ 1], q[ 1] - m[ 5], q[ 2] - m[ 9], m[15] - m[13]);
            this.planes[3].init(q[ 0] + m[ 1], q[ 1] + m[ 5], q[ 2] + m[ 9], m[15] + m[13]);
            this.planes[4].init(q[ 0] - m[ 2], q[ 1] - m[ 6], q[ 2] - m[10], m[15] - m[14]);
            this.planes[5].init(q[ 0] + m[ 2], q[ 1] + m[ 6], q[ 2] + m[10], m[15] + m[14]);
        };

        this.init(mat || SceneJS._math.identityMat4());


        this.boxIntersection = function(box) {
            var ret = SceneJS._math.INSIDE_FRUSTUM;

            var bminmax = [ box.min, box.max ];

            var fp = null;
            for (var i = 0; i < 6; ++i) {
                fp = this.planes[i];
                if (((fp.normal[0] * bminmax[fp.testVertex[0]][0]) +
                     (fp.normal[1] * bminmax[fp.testVertex[1]][1]) +
                     (fp.normal[2] * bminmax[fp.testVertex[2]][2]) +
                     (fp.offset)) < 0.0) {
                    return SceneJS._math.OUTSIDE_FRUSTUM;
                }

                if (((fp.normal[0] * bminmax[1 - fp.testVertex[0]][0]) +
                     (fp.normal[1] * bminmax[1 - fp.testVertex[1]][1]) +
                     (fp.normal[2] * bminmax[1 - fp.testVertex[2]][2]) +
                     (fp.offset)) < 0.0) {
                    ret = SceneJS._math.INTERSECT_FRUSTUM;
                }
            }
            return ret;
        };

        this.axisBoxIntersection = function(axisBox) {
            return this.boxIntersection(axisBox.toBox3());
        };

        this.pointsIntersection = function(points) {
            return this.boxIntersection(new SceneJS._math.Box3().fromPoints(points));
        };
    }
};


