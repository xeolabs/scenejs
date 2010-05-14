/**
 * @class A scene node that defines fog for nodes in its sub graph.

 * <p>Fog is effectively a region on the Z-axis of the view coordinate system within which
 * the colour of elements will blend with the scene ambient colour in proportion to their depth. You can define the
 * points on the Z axis at which the fog region starts and ends, along with the proportion as a linear, exponential
 * or quadratic mode. Scene content falling in front of the start point will have no fog applied, while content
 * after the end point will be invisible, having blended completely into the ambient colour.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/9d8wLu">Example 1</a></li></ul>
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
 *  @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Fog
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Fog = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "fog";
    this._mode = "linear";
    this._color = { r: 0.5, g: 0.5, b: 0.5 };
    this._density = 1.0;
    this._start = 0;
    this._end = 1000.0;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Fog, SceneJS.Node);

/**
 Sets the fogging mode
 @function setMode
 @param {string} mode - "disabled", "exp", "exp2" or "linear"
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setMode = function(mode) {
    if (mode != "disabled" && mode != "exp" && mode != "exp2" && mode != "linear") {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                "SceneJS.fog has a mode of unsupported type: '" + mode + " - should be 'none', 'exp', 'exp2' or 'linear'"));
    }
    this._mode = mode;
    return this;
};

/**
 Returns fogging mode
 @function {string} getMode
 @returns {string} The fog mode - "disabled", "exp", "exp2" or "linear"
 */
SceneJS.Fog.prototype.getMode = function() {
    return this._mode;
};

/**
 Sets the fog color
 @function setColor
 @param {object} color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setColor = function(color) {
    this._color.r = color.r != undefined ? color.r : 0.5;
    this._color.g = color.g != undefined ? color.g : 0.5;
    this._color.b = color.b != undefined ? color.b : 0.5;
    return this;
};

/**
 Returns the fog color
 @function getColor
 @returns {object} Fog color - eg. bright red: {r: 1.0, g: 0, b: 0 }
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
 */
SceneJS.Fog.prototype.setDensity = function(density) {
    this._density = density || 1.0;
    return this;
};

/**
 Returns the fog density
 @function {double} getDensity
 @returns {double} Fog density factor
 */
SceneJS.Fog.prototype.getDensity = function() {
    return this._density;
};

/**
 Sets the near point on the Z view-axis at which fog begins
 @function setStart
 @param {double} start - location on Z-axis
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setStart = function(start) {
    this._start = start || 0;
    return this;
};

/**
 Returns the near point on the Z view-axis at which fog begins
 @function {double} getStart
 @returns {double} Position on Z view axis
 */
SceneJS.Fog.prototype.getStart = function() {
    return this._start;
};

/**
 Sets the farr point on the Z view-axis at which fog ends
 @function setEnd
 @param {double} end - location on Z-axis
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setEnd = function(end) {
    this._end = end || 1000.0;
    return this;
};

/**
 Returns the far point on the Z view-axis at which fog ends
 @function {double} getEnd
 @returns {double} Position on Z view axis
 */
SceneJS.Fog.prototype.getEnd = function() {
    return this._end;
};

// @private
SceneJS.Fog.prototype._init = function(params) {
    if (params.mode) {
        this.setMode(params.mode);
    }
    if (params.color) {
        this.setColor(params.color);
    }
    if (params.density != undefined) {
        this.setDensity(params.density);
    }
    if (params.start != undefined) {
        this.setStart(params.start);
    }
    if (params.end != undefined) {
        this.setEnd(params.end);
    }
};

// @private
SceneJS.Fog.prototype._render = function(traversalContext, data) {
    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if (!this._fixedParams) {
            this._init( this._getParams(data));
        }
        var f = SceneJS_fogModule.getFog();
        SceneJS_fogModule.setFog({
            mode: this._mode,
            color: this._color,
            density: this._density,
            start: this._start,
            end: this._end
        });
        this._renderNodes(traversalContext, data);
        SceneJS_fogModule.setFog(f);
    }
};

/** Returns a new SceneJS.Fog instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Fog constructor
 * @returns {SceneJS.Fog}
 */
SceneJS.fog = function() {
    var n = new SceneJS.Fog();
    SceneJS.Fog.prototype.constructor.apply(n, arguments);
    return n;
};
