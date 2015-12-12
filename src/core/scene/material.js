/*

 TODO: material system from virtualworldframework:

 "color":
 "ambient":
 "specColor":
 "shininess":
 "reflect":
 "specular":
 "emit":
 "alpha":
 "binaryAlpha":
 */
new (function () {

    /**
     * The default state core singleton for {@link SceneJS.Material} nodes
     */
    var defaultCore = {
        type:"material",
        stateId:SceneJS._baseStateId++,
        baseColor:[ 1.0, 1.0, 1.0 ],
        specularColor:[ 1.0, 1.0, 1.0 ],
        emitColor:[ 1.0, 1.0, 1.0 ],
        specular:1.0,
        shine:70.0,
        alpha:1.0,
        emit:0.0
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.material = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines surface material properties for the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Material = SceneJS_NodeFactory.createNodeType("material");

    SceneJS.Material.prototype._init = function (params) {
        if (this._core.useCount == 1) {
            this.setBaseColor(params.color || params.baseColor);
            this.setSpecularColor(params.specularColor);
            this.setEmitColor(params.emitColor);
            this.setSpecular(params.specular);
            this.setShine(params.shine);
            this.setEmit(params.emit);
            this.setAlpha(params.alpha);
        }
    };

    /**
     * @deprecated
     * @param color
     * @return {*}
     */
    SceneJS.Material.prototype.setBaseColor = function (color) {
        var defaultBaseColor = defaultCore.baseColor;
        this._core.baseColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultBaseColor[0],
            color.g != undefined && color.g != null ? color.g : defaultBaseColor[1],
            color.b != undefined && color.b != null ? color.b : defaultBaseColor[2]
        ] : defaultCore.baseColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.setColor = SceneJS.Material.prototype.setBaseColor;

    /**
     * @deprecated
     * @return {Object}
     */
    SceneJS.Material.prototype.getBaseColor = function () {
        return {
            r:this._core.baseColor[0],
            g:this._core.baseColor[1],
            b:this._core.baseColor[2]
        };
    };

    SceneJS.Material.prototype.getColor = SceneJS.Material.prototype.getBaseColor;

    SceneJS.Material.prototype.setSpecularColor = function (color) {
        var defaultSpecularColor = defaultCore.specularColor;
        this._core.specularColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultSpecularColor[0],
            color.g != undefined && color.g != null ? color.g : defaultSpecularColor[1],
            color.b != undefined && color.b != null ? color.b : defaultSpecularColor[2]
        ] : defaultCore.specularColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getSpecularColor = function () {
        return {
            r:this._core.specularColor[0],
            g:this._core.specularColor[1],
            b:this._core.specularColor[2]
        };
    };

    SceneJS.Material.prototype.setEmitColor = function (color) {
        var defaultEmitColor = defaultCore.emitColor;
        this._core.emitColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultEmitColor[0],
            color.g != undefined && color.g != null ? color.g : defaultEmitColor[1],
            color.b != undefined && color.b != null ? color.b : defaultEmitColor[2]
        ] : defaultCore.emitColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getEmitColor = function () {
        return {
            r:this._core.emitColor[0],
            g:this._core.emitColor[1],
            b:this._core.emitColor[2]
        };
    };

    SceneJS.Material.prototype.setSpecular = function (specular) {
        this._core.specular = (specular != undefined && specular != null) ? specular : defaultCore.specular;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getSpecular = function () {
        return this._core.specular;
    };

    SceneJS.Material.prototype.setShine = function (shine) {
        this._core.shine = (shine != undefined && shine != null) ? shine : defaultCore.shine;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getShine = function () {
        return this._core.shine;
    };

    SceneJS.Material.prototype.setEmit = function (emit) {
        this._core.emit = (emit != undefined && emit != null) ? emit : defaultCore.emit;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getEmit = function () {
        return this._core.emit;
    };

    SceneJS.Material.prototype.setAlpha = function (alpha) {
        this._core.alpha = (alpha != undefined && alpha != null) ? alpha : defaultCore.alpha;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getAlpha = function () {
        return this._core.alpha;
    };

    SceneJS.Material.prototype._compile = function (ctx) {
        this._engine.display.material = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.material = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();