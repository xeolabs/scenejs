SceneJs.math = {
    negateVector4: function(v) {
        return [ -v[0], -v[1], -v[2], -v[3] ];
    },

    addVec4: function (u, v) {
        return [ u[0] + v[0], u[1] + v[1], u[2] + v[2], u[3] + v[3] ];
    },

    addVec4s: function (v, s) {
        return [ v[0] + s, v[1] + s, v[2] + s, v[3] + s ];
    },

    add_sv4: function(s, v) {
        return SceneJs.math.addVec4s(v, s)
    },

    subVec4: function(u, v) {
        return [ u[0] - v[0], u[1] - v[1], u[2] - v[2], u[3] - v[3] ];
    },

    subVec4s: function(v, s) {
        return [ v[0] - s, v[1] - s, v[2] - s, v[3] - s ];
    },

    sub_sv4: function(v, s) {
        return [ s - v[0], s - v[1], s - v[2], s - v[3] ];
    },

    mul_v4: function(u, v) {
        return [ u[0] * v[0], u[1] * v[1], u[2] * v[2], u[3] * v[3] ];
    },

    mul_v4s:function(v, s) {
        return [ v[0] * s, v[1] * s, v[2] * s, v[3] * s ];
    },

    div_v4:function(u, v) {
        return [ u[0] / v[0], u[1] / v[1], u[2] / v[2], u[3] / v[3] ];
    },

    div_v4s:function(v, s) {
        return [ v[0] / s, v[1] / s, v[2] / s, v[3] / s ];
    },

    div_sv4:function(s, v) {
        return [ s / v[0], s / v[1], s / v[2], s / v[3] ];
    },

    rcp_v4:function(v) {
        return SceneJs.math.div_sv4(1.0, v);
    },

    dotVector4:function(u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
    },

    cross3Vec4:function(u, v) {
        return [ u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0], 0.0 ];
    },

    sqLenVec4:function(v) {
        return SceneJs.math.dotVector4(v, v);
    },

    lenVec4:function(v) {
        return Math.sqrt(SceneJs.math.sqLenVec4(v));
    },

    normalizeVec4:function(v) {
        var f = 1.0 / SceneJs.math.lenVec4(v);
        return SceneJs.math.mul_v4s(v, f);
    },

    m4:function() {
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
        return [ m[r + 0],  m[r + 4],  m[r + 8],  m[r + 12] ];
    },

    setRowMat4:function(m, r, v) {
        m[r + 0] = v[0];
        m[r + 4] = v[1];
        m[r + 8] = v[2];
        m[r + 12] = v[3];
    },

    setRowMat4c:function(m, r, x, y, z, w) {
        SceneJs.math.setRowMat4(m, r, [x, y, z, w]);
    },

    setRowMat4s:function(m, r, s) {
        SceneJs.math.setRowMat4c(m, r, s, s, s, s);
    },

    getColMat4:function(m, c) {
        var i = c * 4;
        return [ m[i + 0],  m[i + 1], m[i + 2], m[i + 3] ];
    },

    setColMat4v:function(m, c, v) {
        var i = c * 4;
        m[i + 0] = v[0];
        m[i + 1] = v[1];
        m[i + 2] = v[2];
        m[i + 3] = v[3];
    },

    setColMat4c:function(m, c, x, y, z, w) {
        SceneJs.math.setColMat4v(m, c, [x, y, z, w]);
    },

    setColMat4s:function(m, c, s) {
        SceneJs.math.setColMat4c(m, c, s, s, s, s);
    },

    m4to3:function(m) {
        return [
            m[ 0], m[ 1], m[ 2],
            m[ 4], m[ 5], m[ 6],
            m[ 8], m[ 9], m[10]
        ];
    },

    m4s:function(s) {
        return [
            s, s, s, s,
            s, s, s, s,
            s, s, s, s,
            s, s, s, s
        ];
    },

    zero_m4:function() {
        return SceneJs.math.m4s(0.0);
    },

    one_m4:function() {
        return SceneJs.math.m4s(1.0);
    },

    diagonalMat4v:function(v) {
        return [
            v[0],  0.0,  0.0,  0.0,
            0.0, v[1],  0.0,  0.0,
            0.0,  0.0,  v[2], 0.0,
            0.0,  0.0,  0.0,  v[3]
        ];
    },

    diagonalMat4c:function(x, y, z, w) {
        return SceneJs.math.diagonalMat4v([ x, y, z, w ]);
    },

    diagonalMat4s:function(s) {
        return SceneJs.math.diagonalMat4c(s, s, s, s);
    },

    identityMat4:function() {
        return SceneJs.math.diagonalMat4s(1.0);
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
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = -m[i];
        }
        return r;
    },

    addMat4:function(a, b) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] + b[i];
        }
        return r;
    },

    addMat4s:function(m, s)
    {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] + s;
        }
        return r;
    },

    add_sm4:function(s, m) {
        return SceneJs.math.addMat4s(m, s);
    },

    subMat4:function(a, b) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] - b[i];
        }
        return r;
    },

    subMat4s:function(m, s) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] - s;
        }
        return r;
    },

    sub_sm4:function(s, m) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = s - m[i];
        }
        return r;
    },

    mulMat4:function(a, b) {
        var r = new SceneJs.math.m4();
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
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] * s;
        }
        return r;
    },

    mul_sm4:function(s, m) {
        return SceneJs.math.mulMat4s(m, s);
    },

    mulMat4v4:function(m, v) {
        return [
            m[ 0] * v[0] + m[ 4] * v[1] + m[ 8] * v[2] + m[12] * v[3],
            m[ 1] * v[0] + m[ 5] * v[1] + m[ 9] * v[2] + m[13] * v[3],
            m[ 2] * v[0] + m[ 6] * v[1] + m[10] * v[2] + m[14] * v[3],
            m[ 3] * v[0] + m[ 7] * v[1] + m[11] * v[2] + m[15] * v[3]
        ];
    },

    divMat4s:function(m, s) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] / s;
        }
        return r;
    },

    div_sm4:function(s, m) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = s / m[i];
        }
        return r;
    },

    rcp_m4:function(m) {
        return SceneJs.math.div_sm4(1.0, m);
    },

    comp_mulMat4:function(a, b) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] * b[i];
        }
        return r;
    },

    comp_divMat4:function(a, b) {
        var r = new SceneJs.math.m4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] / b[i];
        }
        return r;
    },

    transposeMat4:function(m) {
        var r = new SceneJs.math.m4();
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
        var f =  SceneJs.math.getCellMat4;
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
        var t = new SceneJs.math.m4();

        var f =  SceneJs.math.getCellMat4;

        t[ 0] = f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) - f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) + f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3);
        t[ 1] = f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) + f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) + f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) - f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3);
        t[ 2] = f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) + f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) - f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3);
        t[ 3] = f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2);

        t[ 4] = f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 3);
        t[ 5] = f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 3);
        t[ 6] = f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 3);
        t[ 7] = f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 0) + f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 2);

        t[ 8] = f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 3);
        t[ 9] = f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 3);
        t[10] = f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 3);
        t[11] = f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 2);

        t[12] = f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) + f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3);
        t[13] = f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3);
        t[14] = f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3);
        t[15] = f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) + f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2);

        var s = 1.0 / SceneJs.math.determinantMat4(m);
        var r = SceneJs.math.mulMat4s(t, s);

        return r;
    },

    traceMat4:function(m) {
        return (m[0] + m[5] + m[10] + m[15]);
    },

    translationMat4v:function(v) {
        var m = SceneJs.math.identityMat4();
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return m;
    },

    translationMat4c:function(x, y, z) {
        return SceneJs.math.translationMat4v([x, y, z]);
    },

    translationMat4s:function(s) {
        return SceneJs.math.translationMat4c(s, s, s);
    },

    rotationMat4v:function(angle_rad, axis) {
        var ax = SceneJs.math.normalizeVec4([axis[0], axis[1], axis[2], 0.0]);
        var s = Math.sin(angle_rad);
        var c = Math.cos(angle_rad);
        var q = 1.0 - c;

        var x = ax[0];
        var y = ax[1];
        var z = ax[2];

        var xx, yy, zz, xy, yz, zx, xs, ys, zs;

        xx = x * x;
        yy = y * y;
        zz = z * z;
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;

        var m = new SceneJs.math.m4();

        m[ 0] = (q * xx) + c;
        m[ 1] = (q * xy) + zs;
        m[ 2] = (q * zx) - ys;
        m[ 3] = 0.0;

        m[ 4] = (q * xy) - zs;
        m[ 5] = (q * yy) + c;
        m[ 6] = (q * yz) + xs;
        m[ 7] = 0.0;

        m[ 8] = (q * zx) + ys;
        m[ 9] = (q * yz) - xs;
        m[10] = (q * zz) + c;
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    },

    rotationMat4c:function(angle_rad, x, y, z) {
        return SceneJs.math.rotationMat4v(angle_rad, [x, y, z]);
    },

    scalingMat4v:function(v) {
        var m = SceneJs.math.identityMat4();
        m[ 0] = v[0];
        m[ 5] = v[1];
        m[10] = v[2];
        return m;
    },

    scalingMat4c:function(x, y, z) {
        return SceneJs.math.scalingMat4v([x, y, z]);
    },

    scalingMat4s:function(s) {
        return SceneJs.math.scalingMat4c(s, s, s);
    },

    lookatMat4v:function(position, target, up) {
        var position4 = [position[0], position[1], position[2], 0.0];
        var target4 = [target[0], target[1], target[2], 0.0];
        var up4 = [up[0], up[1], up[2], 0.0];

        var v = SceneJs.math.normalizeVec4(SceneJs.math.subVec4(target4, position4));
        var u = SceneJs.math.normalizeVec4(up4);
        var s = SceneJs.math.normalizeVec4(SceneJs.math.cross3Vec4(v, u));

        u = SceneJs.math.normalizeVec4(SceneJs.math.cross3Vec4(s, v));

        var m = new SceneJs.math.m4();

        m[ 0] = s[0];
        m[ 1] = u[0];
        m[ 2] = -v[0];
        m[ 3] = 0.0;

        m[ 4] = s[1];
        m[ 5] = u[1];
        m[ 6] = -v[1];
        m[ 7] = 0.0;

        m[ 8] = s[2];
        m[ 9] = u[2];
        m[10] = -v[2];
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        m = SceneJs.math.mulMat4(m, SceneJs.math.translationMat4v(SceneJs.math.negateVector4(position4)));

        return m;
    },

    lookatMat4c:function(position_x, position_y, position_z, target_x, target_y, target_z, up_x, up_y, up_z) {
        return SceneJs.math.lookatMat4v([position_x, position_y, position_z], [target_x, target_y, target_z], [up_x, up_y, up_z]);
    },

    orthoMat4v:function(omin, omax) {
        var omin4 = [omin[0], omin[1], omin[2], 0.0];
        var omax4 = [omax[0], omax[1], omax[2], 0.0];
        var v_sum = SceneJs.math.addVec4(omax4, omin4);
        var v_dif = SceneJs.math.subVec4(omax4, omin4);

        var m = new SceneJs.math.m4();

        m[ 0] = 2.0 / v_dif[0];
        m[ 1] = 0.0;
        m[ 2] = 0.0;
        m[ 3] = 0.0;

        m[ 4] = 0.0;
        m[ 5] = 2.0 / v_dif[1];
        m[ 6] = 0.0;
        m[ 7] = 0.0;

        m[ 8] = 0.0;
        m[ 9] = 0.0;
        m[10] = -2.0 / v_dif[2];
        m[11] = 0.0;

        m[12] = -v_sum[0] / v_dif[0];
        m[13] = -v_sum[1] / v_dif[1];
        m[14] = -v_sum[2] / v_dif[2];
        m[15] = 1.0;

        return m;
    },

    orthoMat4c:function(left, right, bottom, top, z_near, z_far) {
        return SceneJs.math.orthoMat4v([left, bottom, z_near], [right, top, z_far]);
    },

    frustumMat4v:function(fmin, fmax) {
        var fmin4 = [fmin[0], fmin[1], fmin[2], 0.0];
        var fmax4 = [fmax[0], fmax[1], fmax[2], 0.0];
        var v_sum = SceneJs.math.addVec4(fmax4, fmin4);
        var v_dif = SceneJs.math.subVec4(fmax4, fmin4);
        var t = 2.0 * fmin4[2];

        var m = new SceneJs.math.m4();

        m[ 0] = t / v_dif[0];
        m[ 1] = 0.0;
        m[ 2] = 0.0;
        m[ 3] = 0.0;

        m[ 4] = 0.0;
        m[ 5] = t / v_dif[1];
        m[ 6] = 0.0;
        m[ 7] = 0.0;

        m[ 8] = v_sum[0] / v_dif[0];
        m[ 9] = v_sum[1] / v_dif[1];
        m[10] = -v_sum[2] / v_dif[2];
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / v_dif[2];
        m[15] = 0.0;

        return m;
    },

    frustumMatrix4:function(left, right, bottom, top, z_near, z_far) {
        var fmin4 = [left, right, bottom, 0.0];
        var fmax4 = [top, z_near, z_far, 0.0];
        var v_sum = SceneJs.math.addVec4(fmax4, fmin4);
        var v_dif = SceneJs.math.subVec4(fmax4, fmin4);
        var t = 2.0 * fmin4[2];

        var m = new SceneJs.math.m4();

        m[ 0] = t / v_dif[0];
        m[ 1] = 0.0;
        m[ 2] = 0.0;
        m[ 3] = 0.0;

        m[ 4] = 0.0;
        m[ 5] = t / v_dif[1];
        m[ 6] = 0.0;
        m[ 7] = 0.0;

        m[ 8] = v_sum[0] / v_dif[0];
        m[ 9] = v_sum[1] / v_dif[1];
        m[10] = -v_sum[2] / v_dif[2];
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / v_dif[2];
        m[15] = 0.0;

        return m;
    },

    perspectiveMatrix4:function(fov_y_rad, aspect_ratio, z_near, z_far) {
        var pmin = new Array(4);
        var pmax = new Array(4);

        pmin[2] = z_near;
        pmax[2] = z_far;

        pmax[1] = pmin[2] * Math.tan(fov_y_rad / 2.0);
        pmin[1] = -pmax[1];

        pmax[0] = pmax[1] * aspect_ratio;
        pmin[0] = -pmax[0];

        return SceneJs.math.frustumMat4v(pmin, pmax);
    },

    transformPoint3:function(m, p) {
        return {
            x : (m[0] * p.x) + (m[4] * p.y) + (m[8] * p.z) + m[12],
            y : (m[1] * p.x) + (m[5] * p.y) + (m[9] * p.z) + m[13],
            z : (m[2] * p.x) + (m[6] * p.y) + (m[10] * p.z) + m[14],
            w : (m[3] * p.x) + (m[7] * p.y) + (m[11] * p.z) + m[15]
        };
    },

    transformVector3:function(m, v) {
        return {
            x: (m[0] * v.x) + (m[4] * v.y) + (m[8] * v.z),
            y: (m[1] * v.x) + (m[5] * v.y) + (m[9] * v.z),
            z: (m[2] * v.x) + (m[6] * v.y) + (m[10] * v.z)
        };
    },

    matrix4to3:function(m4) {
        return [m4[0], m4[1], m4[2], m4[4], m4[5], m4[6], m4[8], m4[9], m4[10]];
    }
};
