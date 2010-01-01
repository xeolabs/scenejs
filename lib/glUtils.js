// Augment Sylvester

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
