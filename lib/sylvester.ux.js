// augment Sylvester some
Matrix.prototype.flatten = function () {
    var result = [];
    if (this.elements.length == 0)
        return [];
    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
}

Matrix.prototype.ensure4x4 = function() {
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

Matrix.prototype.make3x3 = function() {
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([
        [this.elements[0][0], this.elements[0][1], this.elements[0][2]],
        [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
        [this.elements[2][0], this.elements[2][1], this.elements[2][2]]
    ]);
};

Matrix.prototype.scale = function (sx, sy, sz) {
    for (var i = 0; i < 4; i++) {
        this.elements[i][0] *= sx;
        this.elements[i][1] *= sy;
        this.elements[i][2] *= sz;
    }
    return this;
};

Matrix.Translate = function(x, y, z) {
    return Matrix.create([
        [ 1, 0, 0, x ],
        [ 0, 1, 0, y ],
        [ 0, 0, 1, z ],
        [ 0, 0, 0, 1 ]
    ]);
};

Matrix.Scale = function(x, y, z) {
    return Matrix.create([
        [ x, 0, 0, 0 ],
        [ 0, y, 0, 0 ],
        [ 0, 0, z, 0 ],
        [ 0, 0, 0, 1 ]
    ]);
};

Vector.prototype.flatten = function () {
    return this.elements;
};