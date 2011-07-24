(function () {

    var Billboard = SceneJS.createNodeType("billboard");

    Billboard.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Billboard.prototype._preCompile = function() {
        // 0. The base variable
        var superViewXForm = SceneJS_viewTransformModule.transform;
        var lookAt = superViewXForm.lookAt;

        var superModelXForm = SceneJS_modelTransformModule.transform;
        var matrix = superModelXForm.matrix.slice(0);

        // 1. Invert the model rotation matrix, which will reset the subnodes rotation
        var rotMatrix = [
            matrix[0], matrix[1], matrix[2],  0,
            matrix[4], matrix[5], matrix[6],  0,
            matrix[8], matrix[9], matrix[10], 0,
            0,         0,         0,          1
        ];
        SceneJS_math_inverseMat4(rotMatrix);
        SceneJS_math_mulMat4(matrix, rotMatrix, matrix);

        // 2. Get the billboard Z vector
        var ZZ = [];
        SceneJS_math_subVec3(lookAt.eye, lookAt.look, ZZ);
        SceneJS_math_normalizeVec3(ZZ);

        // 3. Get the billboard X vector
        var XX = [];
        SceneJS_math_cross3Vec3(lookAt.up, ZZ, XX);
        SceneJS_math_normalizeVec3(XX);

        // 4. Get the billboard Y vector
        var YY = [];
        SceneJS_math_cross3Vec3(ZZ, XX, YY);
        SceneJS_math_normalizeVec3(YY);

        // 5. Multiply those billboard vector to the matrix
        SceneJS_math_mulMat4(matrix, [
            XX[0], XX[1], XX[2], 0,
            YY[0], YY[1], YY[2], 0,
            ZZ[0], ZZ[1], ZZ[2], 0,
            0,     0,     0,     1
        ], matrix);

        // 6. Render
        SceneJS_modelTransformModule.pushTransform(this.attr.id, { matrix: matrix }); // TODO : memoize!
    };

    Billboard.prototype._postCompile = function() {
        SceneJS_modelTransformModule.popTransform();
    };
})();