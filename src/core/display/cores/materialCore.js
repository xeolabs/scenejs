SceneJS_CoreFactory.createCoreType("material", {

    init : function(params) {

    },

    setBaseColor : function(color) {

        var defaultBaseColor = defaultCore.baseColor;

        this.core.baseColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultBaseColor[0],
            color.g != undefined && color.g != null ? color.g : defaultBaseColor[1],
            color.b != undefined && color.b != null ? color.b : defaultBaseColor[2]
        ] : defaultCore.baseColor;
    },

    getBaseColor : function() {
        return {
            r: this.core.baseColor[0],
            g: this.core.baseColor[1],
            b: this.core.baseColor[2]
        };
    },

    setSpecularColor : function(color) {
        var defaultSpecularColor = defaultCore.specularColor;
        this.core.specularColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultSpecularColor[0],
            color.g != undefined && color.g != null ? color.g : defaultSpecularColor[1],
            color.b != undefined && color.b != null ? color.b : defaultSpecularColor[2]
        ] : defaultCore.specularColor;
        },

    getSpecularColor : function() {
        return {
            r: this.core.specularColor[0],
            g: this.core.specularColor[1],
            b: this.core.specularColor[2]
        };
    },

    setSpecular : function(specular) {
        this.core.specular = (specular != undefined && specular != null) ? specular : defaultCore.specular;
    },

    getSpecular : function() {
        return this.core.specular;
    },

    setShine : function(shine) {
        this.core.shine = (shine != undefined && shine != null) ? shine : defaultCore.shine;
    },

    getShine : function() {
        return this.core.shine;
    },

    setEmit : function(emit) {
        this.core.emit = (emit != undefined && emit != null) ? emit : defaultCore.emit;
    },

    getEmit : function() {
        return this.core.emit;
    },

    setAlpha : function(alpha) {
        this.core.alpha = (alpha != undefined && alpha != null) ? alpha : defaultCore.alpha;
        this._engine.display.imageDirty = true;
        return this;
    },

    getAlpha : function() {
        return this.core.alpha;
    }
});