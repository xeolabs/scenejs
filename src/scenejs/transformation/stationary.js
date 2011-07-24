(function () {

    var Stationary = SceneJS.createNodeType("stationary");

    Stationary.prototype._compile = function() {

        
        var origMemoLevel = this._compileMemoLevel;

        var superXform = SceneJS_viewTransformModule.transform;
        var lookAt = superXform.lookAt;
        if (lookAt) {
            if (this._compileMemoLevel == 0 || (!superXform.fixed)) {
                var tempMat = SceneJS_math_mat4();
                SceneJS_math_mulMat4(superXform.matrix,
                        SceneJS_math_translationMat4v(lookAt.eye), tempMat);
                this._xform = {
                    matrix: tempMat,
                    lookAt: lookAt,
                    fixed: origMemoLevel == 1
                };

                if (superXform.fixed) {
                    this._compileMemoLevel = 1;
                }
           }
            SceneJS_viewTransformModule.pushTransform(this.attr.id, this._xform);
            this._compileNodes();
            SceneJS_viewTransformModule.popTransform();
        } else {
            this._compileNodes();
        }

    };

})();