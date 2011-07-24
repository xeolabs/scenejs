new (function() {

    var DEFAULT_MATERIAL = {
        baseColor :  [ 0.0, 0.0, 0.0 ],
        specularColor :  [ 0.0,  0.0,  0.0 ],
        specular : 1.0,
        shine :  10.0,
        reflect :  0.8,
        alpha :  1.0,
        emit :  0.0
    };

    var idStack = [];
    var materialStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setMaterial(idStack[stackLen - 1], materialStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setMaterial();
                    }
                    dirty = false;
                }
            });

    var Material = SceneJS.createNodeType("material");

    Material.prototype._init = function(params) {
        if (this.core._nodeCount == 1) {
            this.setBaseColor(params.baseColor);
            this.setSpecularColor(params.specularColor);
            this.setSpecular(params.specular);
            this.setShine(params.shine);
            this.setReflect(params.reflect);
            this.setEmit(params.emit);
            this.setAlpha(params.alpha);
            this.setOpacity(params.opacity);
        }
    };

    Material.prototype.setBaseColor = function(color) {
        this.core.baseColor = color ? [
            color.r != undefined && color.r != null ? color.r : 0.0,
            color.g != undefined && color.g != null ? color.g : 0.0,
            color.b != undefined && color.b != null ? color.b : 0.0
        ] : DEFAULT_MATERIAL.baseColor;
    };

    Material.prototype.getBaseColor = function() {
        return {
            r: this.core.baseColor[0],
            g: this.core.baseColor[1],
            b: this.core.baseColor[2]
        };
    };

    Material.prototype.setSpecularColor = function(color) {
        this.core.specularColor = color ? [
            color.r != undefined && color.r != null ? color.r : 0.0,
            color.g != undefined && color.g != null ? color.g : 0.0,
            color.b != undefined && color.b != null ? color.b : 0.0
        ] : DEFAULT_MATERIAL.specularColor;
    };

    Material.prototype.getSpecularColor = function() {
        return {
            r: this.core.specularColor[0],
            g: this.core.specularColor[1],
            b: this.core.specularColor[2]
        };
    };

    Material.prototype.setSpecular = function(specular) {
        this.core.specular = (specular != undefined && specular != null) ? specular : DEFAULT_MATERIAL.specular;
    };

    Material.prototype.getSpecular = function() {
        return this.core.specular;
    };

    Material.prototype.setShine = function(shine) {
        this.core.shine = (shine != undefined && shine != null) ? shine : DEFAULT_MATERIAL.shine;
    };

    Material.prototype.getShine = function() {
        return this.core.shine;
    };

    Material.prototype.setReflect = function(reflect) {
        this.core.reflect = (reflect != undefined && reflect != null) ? reflect : DEFAULT_MATERIAL.reflect;
    };

    Material.prototype.getReflect = function() {
        return this.core.reflect;
    };

    Material.prototype.setEmit = function(emit) {
        this.core.emit = (emit != undefined && emit != null) ? emit : DEFAULT_MATERIAL.emit;
    };

    Material.prototype.getEmit = function() {
        return this.core.emit;
    };

    Material.prototype.setAlpha = function(alpha) {
        this.core.alpha = (alpha != undefined && alpha != null) ? alpha : DEFAULT_MATERIAL.alpha;
    };

    Material.prototype.getAlpha = function() {
        return this.core.alpha;
    };

    Material.prototype.setOpacity = function(opacity) {
        this.core.opacity = (opacity != undefined && opacity != null) ? opacity : DEFAULT_MATERIAL.opacity;
    };

    Material.prototype.getOpacity = function() {
        return this.core.opacity;
    };

    Material.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Material.prototype._preCompile = function() {
        //        var top = stackLen > 0 ? materialStack[stackLen - 1] : null;
        //        var origMemoLevel = this._compileMemoLevel;
        //        if (this._compileMemoLevel == 0 || (top && !top.fixed)) {
        //            var m = this.attr;
        //            top = top || DEFAULT_MATERIAL;
        //            this._material = {
        //                baseColor : m.baseColor ? [ m.baseColor.r, m.baseColor.g, m.baseColor.b ] : top.baseColor,
        //                specularColor: m.specularColor ? [ m.specularColor.r, m.specularColor.g, m.specularColor.b ] : top.specularColor,
        //                specular : (m.specular != undefined ) ? m.specular : top.specular,
        //                shine : (m.shine != undefined ) ? m.shine : top.shine,
        //                reflect : (m.reflect != undefined) ? m.reflect : top.reflect,
        //                alpha : (m.alpha != undefined) ? m.alpha : top.alpha,
        //                emit : (m.emit != undefined) ? m.emit : top.emit,
        //                opacity : (m.opacity != undefined) ? m.opacity : top.opacity
        //            };
        //            this._compileMemoLevel = 1;
        //        }
        //        this._material.fixed = (origMemoLevel == 1); // State not changed because of update to this node

        idStack[stackLen] = this.attr.id;           // Push material
        materialStack[stackLen] = this.core;       
        stackLen++;
        dirty = true;
    };

    Material.prototype._postCompile = function() {
        stackLen--;                                 // Pop material
        dirty = true;
    };


    Material.prototype._destroy = function() {};

})();