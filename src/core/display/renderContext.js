/**
 * @class A facade which exposes internal scene rendering state to "rendered" event listeners bound to scene graph nodes with {@link SceneJS.Node#bind}.
 *
 * <p>The listener is fired for each {@link SceneJS.Geometry} that is rendered within the subgraph of the bound node.
 * An instance of this facade is passed into the listener's handler, enabling the listener to obtain the various transform
 * matrices that are active at that {@link SceneJS.Geometry}.</p>
 *
 * <p>The facade instance is only valid within the callback's execution; internally, SceneJS reuses the same instance of the
 * facade with each scene.</p>
 */
SceneJS.RenderContext = function(frameCtx) {
    this._frameCtx = frameCtx;
};

/**
 * Get the projection matrix, as defined by the active {@link SceneJS.Camera} node.
 */
SceneJS.RenderContext.prototype.getCameraMatrix = function() {
    return this._frameCtx.cameraMat;
};

/**
 * Get the view matrix, as defined by the active {@link SceneJS.LookAt} node.
 */
SceneJS.RenderContext.prototype.getViewMatrix = function() {
    return this._frameCtx.viewMat;
};

/**
 * Get the model matrix, as defined by the active {@link SceneJS.XForm} node.
 */
SceneJS.RenderContext.prototype.getModelMatrix = function() {
    return this._frameCtx.modelMat;
};

/**
 * Transforms the given world coordinate by the model, view and projection matrices defined by the active {@link SceneJS.XForm}, {@link SceneJS.LookAt} and {@link SceneJS.Camera} nodes.
 * @returns [Number] The 2D Canvas-space coordinate
 */
SceneJS.RenderContext.prototype.getCanvasPos = function(offset) {

    this.getProjPos(offset);

    var canvas = this._frameCtx.canvas.canvas;
    var resolutionScaling = this._frameCtx.canvas.resolutionScaling;
    var canvasWidth = canvas.width / resolutionScaling;
    var canvasHeight = canvas.height / resolutionScaling;

    /* Projection division and map to canvas
     */
    var pc = this._pc;

    var x = (pc[0] / pc[3]) * canvasWidth * 0.5;
    var y = (pc[1] / pc[3]) * canvasHeight * 0.5;

    return {
        x: x + (canvasWidth * 0.5),
        y: canvasHeight - y - (canvasHeight * 0.5)
    };
};

/**
 * Transforms the given world coordinate by the model and view matrices defined by the active {@link SceneJS.XForm} and {@link SceneJS.LookAt} nodes.
 * @returns [Number] The 3D Projection-space coordinate
 */
SceneJS.RenderContext.prototype.getCameraPos = function(offset) {
    this.getProjPos(offset);
    this._camPos = SceneJS_math_normalizeVec3(this._pc, [0,0,0]);
    return { x: this._camPos[0], y: this._camPos[1], z: this._camPos[2] }; // TODO: return _camPos and lose the temp object
};


SceneJS.RenderContext.prototype.getProjPos = function(offset) {
    this.getViewPos(offset);
    this._pc = SceneJS_math_transformPoint3(this._frameCtx.cameraMat, this._vc);
    return { x: this._pc[0], y: this._pc[1], z: this._pc[2],  w: this._pc[3] };
};

SceneJS.RenderContext.prototype.getViewPos = function(offset) {
    this.getWorldPos(offset);
    this._vc = SceneJS_math_transformPoint3(this._frameCtx.viewMat, this._wc);
    return { x: this._vc[0], y: this._vc[1], z: this._vc[2],  w: this._vc[3] };
};

SceneJS.RenderContext.prototype.getWorldPos = function(offset) {
    this._wc = SceneJS_math_transformPoint3(this._frameCtx.modelMat, offset || [0,0,0]);
    return { x: this._wc[0], y: this._wc[1], z: this._wc[2],  w: this._wc[3] };
};
