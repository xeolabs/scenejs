//// augment Sylvester some
//Matrix.Translation = function (v)
//{
//    if (v.elements.length == 2) {
//        var r = Matrix.I(3);
//        r.elements[2][0] = v.elements[0];
//        r.elements[2][1] = v.elements[1];
//        return r;
//    }
//
//    if (v.elements.length == 3) {
//        var r = Matrix.I(4);
//        r.elements[0][3] = v.elements[0];
//        r.elements[1][3] = v.elements[1];
//        r.elements[2][3] = v.elements[2];
//        return r;
//    }
//
//    throw "Invalid length for Translation";
//}

Matrix.prototype.flatten = function () {
    var result = [];
    if (this.elements.length == 0)
        return [];


    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
}

Matrix.prototype.ensure4x4 = function()
{
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;

    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;

    for (var i = 0; i < this.elements.length; i++) {
        for (var j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (var i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
                this.elements.push([0, 0, 1, 0]);
            else if (i == 3)
                    this.elements.push([0, 0, 0, 1]);
    }

    return this;
};

Matrix.prototype.make3x3 = function()
{
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([
        [this.elements[0][0], this.elements[0][1], this.elements[0][2]],
        [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
        [this.elements[2][0], this.elements[2][1], this.elements[2][2]]
    ]);
};

Vector.prototype.flatten = function () {
    return this.elements;
};


Matrix.prototype.transformPoint3 = function(p) {
    var p = {
        x : (this.elements[0] * p.x) + (this.elements[4] * p.y) + (this.elements[8] * p.z) + this.elements[12],
        y : (this.elements[1] * p.x) + (this.elements[5] * p.y) + (this.elements[9] * p.z) + this.elements[13],
        z : (this.elements[2] * p.x) + (this.elements[6] * p.y) + (this.elements[10] * p.z) + this.elements[14],
        w : (this.elements[3] * p.x) + (this.elements[7] * p.y) + (this.elements[11] * p.z) + this.elements[15]
    };
    return p;
};

Matrix.prototype.transformVector3 = function(v) {
    var p = {
        x: (this.elements[0][0] * v.x) + (this.elements[1][0] * v.y) + (this.elements[2][0] * v.z),
        y: (this.elements[0][1] * v.x) + (this.elements[1][1] * v.y) + (this.elements[2][1] * v.z),
        z: (this.elements[0][2] * v.x) + (this.elements[1][2] * v.y) + (this.elements[2][2] * v.z)
    };
    return p;
};

//
////
//// glOrtho
////
//function makeOrtho(left, right,
//                   bottom, top,
//                   znear, zfar)
//{
//    var tx = -(right + left) / (right - left);
//    var ty = -(top + bottom) / (top - bottom);
//    var tz = -(zfar + znear) / (zfar - znear);
//
//    return $M([
//        [2 / (right - left), 0, 0, tx],
//        [0, 2 / (top - bottom), 0, ty],
//        [0, 0, -2 / (zfar - znear), tz],
//        [0, 0, 0, 1]
//    ]);
//}
//
//function makeFrustum(left, right,
//                     bottom, top,
//                     znear, zfar)
//{
//    var X = 2 * znear / (right - left);
//    var Y = 2 * znear / (top - bottom);
//    var A = (right + left) / (right - left);
//    var B = (top + bottom) / (top - bottom);
//    var C = -(zfar + znear) / (zfar - znear);
//    var D = -2 * zfar * znear / (zfar - znear);
//
//    return $M([
//        [X, 0, A, 0],
//        [0, Y, B, 0],
//        [0, 0, C, D],
//        [0, 0, -1, 0]
//    ]);
//}
//
////
//// gluPerspective
////
//function makePerspective(fovy, aspect, znear, zfar)
//{
//    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
//    var ymin = -ymax;
//    var xmin = ymin * aspect;
//    var xmax = ymax * aspect;
//
//    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
//}
//
//
//
//
//function makeLookAt(ex, ey, ez,
//                    cx, cy, cz,
//                    ux, uy, uz)
//{
//    var eye = $V([ex, ey, ez]);
//    var center = $V([cx, cy, cz]);
//    var up = $V([ux, uy, uz]);
//
//    var z = eye.subtract(center).toUnitVector();
//    var x = up.cross(z).toUnitVector();
//    var y = z.cross(x).toUnitVector();
//
//    var m = $M([
//        [x.e(1), x.e(2), x.e(3), 0],
//        [y.e(1), y.e(2), y.e(3), 0],
//        [z.e(1), z.e(2), z.e(3), 0],
//        [0, 0, 0, 1]
//    ]);
//
//    var t = $M([
//        [1, 0, 0, -ex],
//        [0, 1, 0, -ey],
//        [0, 0, 1, -ez],
//        [0, 0, 0, 1]
//    ]);
//    return m.x(t);
//}
//
//function makeTranslate(x, y, z) {
//    return Matrix.create([
//        [ 1, 0, 0, x ],
//        [ 0, 1, 0, y ],
//        [ 0, 0, 1, z ],
//        [ 0, 0, 0, 1 ]
//    ]);
//};
//
//function makeScale(x, y, z) {
//    return Matrix.create([
//        [ x, 0, 0, 0 ],
//        [ 0, y, 0, 0 ],
//        [ 0, 0, z, 0 ],
//        [ 0, 0, 0, 1 ]
//    ]);
//};