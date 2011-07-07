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
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setMaterial(idStack[stackLen - 1], materialStack[stackLen - 1]);
                    } else  { // Full compile supplies it's own default states
                        SceneJS_renderModule.setMaterial();
                    }
                    dirty = false;
                }
            });

    var Material = SceneJS.createNodeType("material");

    Material.prototype._init = function(params) {
        this.setBaseColor(params.baseColor);
        this.setHighlightBaseColor(params.highlightBaseColor);
        this.setSpecularColor(params.specularColor);
        this.setSpecular(params.specular);
        this.setShine(params.shine);
        this.setReflect(params.reflect);
        this.setEmit(params.emit);
        this.setAlpha(params.alpha);
        this.setOpacity(params.opacity);
    };

    Material.prototype.setBaseColor = function(color) {
        this.attr.baseColor = color ? {
            r: color.r != undefined && color.r != null ? color.r : 0.0,
            g: color.g != undefined && color.g != null ? color.g : 0.0,
            b: color.b != undefined && color.b != null ? color.b : 0.0
        } : undefined;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getBaseColor = function() {
        return this.attr.baseColor ? {
            r: this.attr.baseColor.r,
            g: this.attr.baseColor.g,
            b: this.attr.baseColor.b
        } : undefined;
    };

    Material.prototype.setHighlightBaseColor = function(color) {
        this.attr.highlightBaseColor = color ? {
            r: color.r != undefined && color.r != null ? color.r : 0.0,
            g: color.g != undefined && color.g != null ? color.g : 0.0,
            b: color.b != undefined && color.b != null ? color.b : 0.0
        } : undefined;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getHighlightBaseColor = function() {
        return this.attr.highlightBaseColor ? {
            r: this.attr.highlightBaseColor.r,
            g: this.attr.highlightBaseColor.g,
            b: this.attr.highlightBaseColor.b
        } : undefined;
    };

    Material.prototype.setSpecularColor = function(color) {
        this.attr.specularColor = color ? {
            r: color.r != undefined && color.r != null ? color.r : 0.0,
            g: color.g != undefined && color.g != null ? color.g : 0.0,
            b: color.b != undefined && color.b != null ? color.b : 0.0
        } : undefined;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getBaseColor = function() {
        return this.attr.baseColor ? {
            r: this.attr.baseColor.r,
            g: this.attr.baseColor.g,
            b: this.attr.baseColor.b
        } : undefined;
    };

    Material.prototype.getSpecularColor = function() {
        return this.attr.specularColor ? {
            r: this.attr.specularColor.r,
            g: this.attr.specularColor.g,
            b: this.attr.specularColor.b
        } : undefined;
    };

    Material.prototype.setSpecular = function(specular) {
        this.attr.specular = specular;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getSpecular = function() {
        return this.attr.specular;
    };

    Material.prototype.setShine = function(shine) {
        this.attr.shine = shine;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getShine = function() {
        return this.attr.shine;
    };

    Material.prototype.setReflect = function(reflect) {
        this.attr.reflect = reflect;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getReflect = function() {
        return this.attr.reflect;
    };

    Material.prototype.setEmit = function(emit) {
        this.attr.emit = emit;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getEmit = function() {
        return this.attr.emit;
    };

    Material.prototype.setAlpha = function(alpha) {
        this.attr.alpha = alpha;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getAlpha = function() {
        return this.attr.alpha;
    };

    Material.prototype.setOpacity = function(opacity) {
        this.attr.opacity = opacity;
        this._compileMemoLevel = 0;
    };

    Material.prototype.getOpacity = function() {
        return this.attr.opacity;
    };

    Material.prototype._compile = function(traversalContext) {
        this._preCompile();
        this._compileNodes(traversalContext);
        this._postCompile();
    };

    Material.prototype._preCompile = function() {
        var top = stackLen > 0 ? materialStack[stackLen - 1] : null;
        var origMemoLevel = this._compileMemoLevel;
        if (this._compileMemoLevel == 0 || (top && !top.fixed)) {
            var m = this.attr;
            top = top || DEFAULT_MATERIAL;
            this._material = {
                baseColor : m.baseColor ? [ m.baseColor.r, m.baseColor.g, m.baseColor.b ] : top.baseColor,
                specularColor: m.specularColor ? [ m.specularColor.r, m.specularColor.g, m.specularColor.b ] : top.specularColor,
                specular : (m.specular != undefined ) ? m.specular : top.specular,
                shine : (m.shine != undefined ) ? m.shine : top.shine,
                reflect : (m.reflect != undefined) ? m.reflect : top.reflect,
                alpha : (m.alpha != undefined) ? m.alpha : top.alpha,
                emit : (m.emit != undefined) ? m.emit : top.emit,
                opacity : (m.opacity != undefined) ? m.opacity : top.opacity
            };
            this._compileMemoLevel = 1;
        }
        this._material.fixed = (origMemoLevel == 1); // State not changed because of update to this node

        idStack[stackLen] = this.attr.id;           // Push material
        materialStack[stackLen] = this._material;
        stackLen++;
        dirty = true;
    };

    Material.prototype._postCompile = function() {
        stackLen--;                                 // Pop material
        dirty = true;
    };
})();