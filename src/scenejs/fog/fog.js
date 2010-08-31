/**
 * @class A scene node that defines fog for nodes in its sub graph.

 * <p>Fog is effectively a region on the Z-axis of the view coordinate system within which
 * the colour of elements will blend with the scene ambient colour in proportion to their depth. You can define the
 * points on the Z axis at which the fog region starts and ends, along with the proportion as a linear, exponential
 * or quadratic mode. Scene content falling in front of the start point will have no fog applied, while content
 * after the end point will be invisible, having blended completely into the ambient colour.</p>
 *
 * <p><b>Example Usage</b></p><p>Definition of fog with parameters that happen to be the defaults -
 * starting at Z=1, extending until Z=1000, linear mode, gray colour. Objects beyond Z=1000 will be entirely merged
 * into the background.</b></p><pre><code>
 * var fog = new SceneJS.Fog({
 *         mode:"linear",
 *         color: { r: 0.5, g: 0.5, b: 0.5 },
 *         density: 1.0,
 *         start: 1,
 *         end: 1000
 *     },
 *
 *     // ... child nodes
 * )
 * </pre></code>
 * @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Creates a new SceneJS.Fog
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.mode = "linear"] The fog mode - "disabled", "exp", "exp2" or "linear"
 * @param {Object} [cfg.color = {r: 0.5, g: 0.5, b: 0.5 } The fog color
 * @param {double} [cfg.density = 1.0] The fog density factor
 * @param {double} [cfg.start = 1.0] Point on Z-axis at which fog effect begins
 * @param {double} [cfg.end = 1.0] Point on Z-axis at which fog effect ends
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Fog = SceneJS.createNodeType("fog");

// @private
SceneJS.Fog.prototype._init = function(params) {
    this.setMode(params.mode);
    this.setColor(params.color);
    this.setDensity(params.density);
    this.setStart(params.start);
    this.setEnd(params.end);
};

/**
 Sets the fogging mode
 @function setMode
 @param {string} mode - "disabled", "exp", "exp2" or "linear"
 @returns {SceneJS.Fog} This fog node
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setMode = function(mode) {
    mode = mode || "disabled";
    if (mode != "disabled" && mode != "exp" && mode != "exp2" && mode != "linear") {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "SceneJS.fog has a mode of unsupported type: '" + mode + " - should be 'none', 'exp', 'exp2' or 'linear'"));
    }
    this._mode = mode;
    this._setDirty();
    return this;
};

/**
 Returns fogging mode
 @function {string} getMode
 @returns {string} The fog mode - "disabled", "exp", "exp2" or "linear"
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getMode = function() {
    return this._mode;
};

/**
 Sets the fog color
 @function setColor
 @param {object} color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 @returns {SceneJS.Fog} This fog node
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setColor = function(color) {
    color = color || {};
    this._color = {};
    this._color.r = color.r != undefined ? color.r : 0.5;
    this._color.g = color.g != undefined ? color.g : 0.5;
    this._color.b = color.b != undefined ? color.b : 0.5;
    this._setDirty();
    return this;
};

/**
 Returns the fog color
 @function getColor
 @returns {object} Fog color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getColor = function() {
    return {
        r: this._color.r,
        g: this._color.g,
        b: this._color.b
    };
};

/**
 Sets the fog density
 @function setDensity
 @param {double} density - density factor
 @returns {SceneJS.Fog} This fog node
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setDensity = function(density) {
    this._density = density || 1.0;
    this._setDirty();
    return this;
};

/**
 Returns the fog density
 @function {double} getDensity
 @returns {double} Fog density factor
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getDensity = function() {
    return this._density;
};

/**
 Sets the near point on the Z view-axis at which fog begins
 @function setStart
 @param {double} start - location on Z-axis
 @returns {SceneJS.Fog} This fog node
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setStart = function(start) {
    this._start = start || 0;
    this._setDirty();
    return this;
};

/**
 Returns the near point on the Z view-axis at which fog begins
 @function {double} getStart
 @returns {double} Position on Z view axis
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getStart = function() {
    return this._start;
};

/**
 Sets the farr point on the Z view-axis at which fog ends
 @function setEnd
 @param {double} end - location on Z-axis
 @returns {SceneJS.Fog} This fog node
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setEnd = function(end) {
    this._end = end || 1000.0;
    this._setDirty();
    return this;
};

/**
 Returns the far point on the Z view-axis at which fog ends
 @function {double} getEnd
 @returns {double} Position on Z view axis
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getEnd = function() {
    return this._end;
};


// @private
SceneJS.Fog.prototype._render = function(traversalContext) {
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {

        /* Don't need fog for pick traversal (TODO: unless we want to supress picking of things hidden by fog?)
         */
        this._renderNodes(traversalContext);
    } else {
        var f = SceneJS._fogModule.getFog();
        SceneJS._fogModule.setFog({
            mode: this._mode,
            color: this._color,
            density: this._density,
            start: this._start,
            end: this._end
        });
        this._renderNodes(traversalContext);
        SceneJS._fogModule.setFog(f);
    }
};