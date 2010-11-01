/** @class A scene node that sets WebGL state for nodes in its subtree.
 * <p>This node basically exposes various WebGL state configurations through the SceneJS API.</p>
 * (TODO: more comments here!)

 * @extends SceneJS.Node
 */
SceneJS.Renderer = SceneJS.createNodeType("renderer");


// @private
SceneJS.Renderer.prototype._init = function(params) {
    this._attr = params || {};
};

SceneJS.Renderer.prototype.setViewport = function(viewport) {
    this._attr.viewport = viewport ? {
        x : viewport.x || 1,
        y : viewport.y || 1,
        width: viewport.width || 1000,
        height: viewport.height || 1000
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getViewport = function() {
    return this._attr.viewport ? {
        x : this._attr.viewport.x,
        y : this._attr.viewport.y,
        width: this._attr.viewport.width,
        height: this._attr.viewport.height
    } : undefined;
};

SceneJS.Renderer.prototype.setScissor = function(scissor) {
    this._attr.scissor = scissor ? {
        x : scissor.x || 1,
        y : scissor.y || 1,
        width: scissor.width || 1000,
        height: scissor.height || 1000
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getScissor = function() {
    return this._attr.scissor ? {
        x : this._attr.scissor.x,
        y : this._attr.scissor.y,
        width: this._attr.scissor.width,
        height: this._attr.scissor.height
    } : undefined;
};

SceneJS.Renderer.prototype.setClear = function(clear) {
    this._attr.clear = clear ? {
        r : clear.r || 0,
        g : clear.g || 0,
        b : clear.b || 0
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getClear = function() {
    return this._attr.clear ? {
        r : this._attr.clear.r,
        g : this._attr.clear.g,
        b : this._attr.clear.b
    } : null;
};

SceneJS.Renderer.prototype.setEnableBlend = function(enableBlend) {
    this._attr.enableBlend = enableBlend;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getEnableBlend = function() {
    return this._attr.enableBlend;
};

SceneJS.Renderer.prototype.setBlendColor = function(color) {
    this._attr.blendColor = color ? {
        r : color.r || 0,
        g : color.g || 0,
        b : color.b || 0,
        a : (color.a == undefined || color.a == null) ? 1 : color.a
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getBlendColor = function() {
    return this._attr.blendColor ? {
        r : this._attr.blendColor.r,
        g : this._attr.blendColor.g,
        b : this._attr.blendColor.b,
        a : this._attr.blendColor.a
    } : undefined;
};

SceneJS.Renderer.prototype.setBlendEquation = function(eqn) {
    this._attr.blendEquation = eqn;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getBlendEquation = function() {
    return this._attr.blendEquation;
};

SceneJS.Renderer.prototype.setBlendEquationSeparate = function(eqn) {
    this._attr.blendEquationSeparate = eqn ? {
        rgb : eqn.rgb || "funcAdd",
        alpha : eqn.alpha || "funcAdd"
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getBlendEquationSeparate = function() {
    return this._attr.blendEquationSeparate ? {
        rgb : this._attr.rgb,
        alpha : this._attr.alpha
    } : undefined;
};

SceneJS.Renderer.prototype.setBlendFunc = function(funcs) {
    this._attr.blendFunc = funcs ? {
        sfactor : funcs.sfactor || "srcAlpha",
        dfactor : funcs.dfactor || "less"
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getBlendFunc = function() {
    return this._attr.blendFunc ? {
        sfactor : this._attr.sfactor,
        dfactor : this._attr.dfactor
    } : undefined;
};

SceneJS.Renderer.prototype.setBlendFuncSeparate = function(eqn) {
    this._attr.blendFuncSeparate = eqn ? {
        srcRGB : eqn.srcRGB || "zero",
        dstRGB : eqn.dstRGB || "zero",
        srcAlpha : eqn.srcAlpha || "zero",
        dstAlpha : eqn.dstAlpha || "zero"
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getBlendFuncSeparate = function() {
    return this._attr.blendFuncSeparate ? {
        srcRGB : this._attr.blendFuncSeparate.srcRGB,
        dstRGB : this._attr.blendFuncSeparate.dstRGB,
        srcAlpha : this._attr.blendFuncSeparate.srcAlpha,
        dstAlpha : this._attr.blendFuncSeparate.dstAlpha
    } : undefined;
};

SceneJS.Renderer.prototype.setEnableCullFace = function(enableCullFace) {
    this._attr.enableCullFace = enableCullFace;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getEnableCullFace = function() {
    return this._attr.enableCullFace;
};


SceneJS.Renderer.prototype.setCullFace = function(cullFace) {
    this._attr.cullFace = cullFace;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getCullFace = function() {
    return this._attr.cullFace;
};

SceneJS.Renderer.prototype.setEnableDepthTest = function(enableDepthTest) {
    this._attr.enableDepthTest = enableDepthTest;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getEnableDepthTest = function() {
    return this._attr.enableDepthTest;
};

SceneJS.Renderer.prototype.setDepthFunc = function(depthFunc) {
    this._attr.depthFunc = depthFunc;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getDepthFunc = function() {
    return this._attr.depthFunc;
};

SceneJS.Renderer.prototype.setEnableDepthMask = function(enableDepthMask) {
    this._attr.enableDepthMask = enableDepthMask;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getEnableDepthMask = function() {
    return this._attr.enableDepthMask;
};

SceneJS.Renderer.prototype.setClearDepth = function(clearDepth) {
    this._attr.clearDepth = clearDepth;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getClearDepth = function() {
    return this.attr.clearDepth;
};

SceneJS.Renderer.prototype.setDepthRange = function(range) {
    this._attr.depthRange = range ? {
        zNear : (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
        zFar : (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getDepthRange = function() {
    return this._attr.depthRange ? {
        zNear : this._attr.depthRange.zNear,
        zFar : this._attr.depthRange.zFar
    } : undefined;
};

SceneJS.Renderer.prototype.setFrontFace = function(frontFace) {
    this._attr.frontFace = frontFace;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getFrontFace = function() {
    return this.attr.frontFace;
};

SceneJS.Renderer.prototype.setLineWidth = function(lineWidth) {
    this._attr.lineWidth = lineWidth;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getLineWidth = function() {
    return this.attr.lineWidth;
};

SceneJS.Renderer.prototype.setEnableScissorTest = function(enableScissorTest) {
    this._attr.enableScissorTest = enableScissorTest;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getEnableScissorTest = function() {
    return this.attr.enableScissorTest;
};

SceneJS.Renderer.prototype.setClearStencil = function(clearStencil) {
    this._attr.clearStencil = clearStencil;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getClearStencil = function() {
    return this.attr.clearStencil;
};

SceneJS.Renderer.prototype.setColorMask = function(color) {
    this._attr.colorMask = color ? {
        r : color.r || 0,
        g : color.g || 0,
        b : color.b || 0,
        a : (color.a == undefined || color.a == null) ? 1 : color.a
    } : undefined;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getColorMask = function() {
    return this._attr.colorMask ? {
        r : this._attr.colorMask.r,
        g : this._attr.colorMask.g,
        b : this._attr.colorMask.b,
        a : this._attr.colorMask.a
    } : undefined;
};

SceneJS.Renderer.prototype.setWireframe = function(wireframe) {
    this._attr.wireframe = wireframe;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getWireframe = function() {
    return this.attr.wireframe;
};

SceneJS.Renderer.prototype.setHighlight = function(highlight) {
    this._attr.highlight = highlight;
    this._memoLevel = 0;
};

SceneJS.Renderer.prototype.getHighlight = function() {
    return this._attr.highlight;
};

// @private
SceneJS.Renderer.prototype._render = function(traversalContext) {
    if (this._memoLevel == 0) {
        this._props = SceneJS._rendererModule.createProps(this._attr);
        this._memoLevel = 1;
    }
    SceneJS._rendererModule.pushProps(this._props);
    this._renderNodes(traversalContext);
    SceneJS._rendererModule.popProps(this._props);
};