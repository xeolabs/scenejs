/**
 * @class A scene node that defines fog for nodes in its sub graph.

 * <p>Fog is effectively a region on the Z-axis of the view coordinate system within which
 * the colour of elements will blend with the scene ambient colour in proportion to their depth. You can define the
 * points on the Z axis at which the fog region starts and ends, along with the proportion as a linear, exponential
 * or quadratic mode. Scene content falling in front of the start point will have no fog applied, while content
 * after the end point will be invisible, having blended completely into the ambient colour.</p>
 *
 * <p><b>Example Usage</b></p><p>Definition of fog -
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
    this._attr = {};
    this.setMode(params.mode);
    this.setColor(params.color);
    this.setDensity(params.density);
    this.setStart(params.start);
    this.setEnd(params.end);
};

/**
 Sets the fogging mode. Default is "disabled".
 @function setMode
 @param {string} mode - "disabled", "exp", "exp2" or "linear"
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setMode = function(mode) {
    mode = mode || "disabled";
    if (mode != "disabled" && mode != "exp" && mode != "exp2" && mode != "linear") {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "SceneJS.fog has a mode of unsupported type: '" + mode + " - should be 'disabled', 'exp', 'exp2' or 'linear'"));
    }
    this._attr.mode = mode;
};

/**
 Returns fogging mode
 @function {string} getMode
 @returns {string} The fog mode - "disabled", "exp", "exp2" or "linear"
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getMode = function() {
    return this._attr.mode;
};

/**
 Sets the fog color
 @function setColor
 @param {object} color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setColor = function(color) {
    color = color || {};
    this._attr.color = {
        r : color.r != undefined ? color.r : 0.5,
        g : color.g != undefined ? color.g : 0.5,
        b : color.b != undefined ? color.b : 0.5
    };
};

/**
 Returns the fog color
 @function getColor
 @returns {object} Fog color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getColor = function() {
    return {
        r: this._attr.color.r,
        g: this._attr.color.g,
        b: this._attr.color.b
    };
};

/**
 Sets the fog density
 @function setDensity
 @param {double} density - density factor
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setDensity = function(density) {
    this._attr.density = density || 1.0;
};

/**
 Returns the fog density
 @function {double} getDensity
 @returns {double} Fog density factor
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getDensity = function() {
    return this._attr.density;
};

/**
 Sets the near point on the Z view-axis at which fog begins
 @function setStart
 @param {double} start - location on Z-axis
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setStart = function(start) {
    this._attr.start = start || 0;
};

/**
 Returns the near point on the Z view-axis at which fog begins
 @function {double} getStart
 @returns {double} Position on Z view axis
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getStart = function() {
    return this._attr.start;
};

/**
 Sets the farr point on the Z view-axis at which fog ends
 @function setEnd
 @param {double} end - location on Z-axis
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.setEnd = function(end) {
    this._attr.end = end || 1000.0;
};

/**
 Returns the far point on the Z view-axis at which fog ends
 @function {double} getEnd
 @returns {double} Position on Z view axis
 @since Version 0.7.4
 */
SceneJS.Fog.prototype.getEnd = function() {
    return this._attr.end;
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.Fog.prototype.getAttributes = function() {
    return {
        mode: this._attr.mode,
        color: {
            r: this._attr.color.r,
            g: this._attr.color.g,
            b: this._attr.color.b
        },
        density: this._attr.density,
        start: this._attr.start,
        end: this._attr.end
    };
};

// @private
SceneJS.Fog.prototype._render = function(traversalContext) {
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext); // No fog for pick
    } else {
        SceneJS._fogModule.pushFog(this._attr);
        this._renderNodes(traversalContext);
        SceneJS._fogModule.popFog();
    }
};