/**
 *
 */
var SceneJS_Canvas = function (id, canvasId, contextAttr, options) {

    /**
     * ID of this canvas
     */
    this.canvasId;

    if (!canvasId) {
        // Automatic default canvas
        canvasId = "canvas-" + id;
        var body = document.getElementsByTagName("body")[0];
        var div = document.createElement('div');
        var style = div.style;
        style.height = "100%";
        style.width = "100%";
        style.padding = "0";
        style.margin = "0";
        style.left = "0";
        style.top = "0";
        style.position = "absolute";
        // style["z-index"] = "10000";
        div.innerHTML += '<canvas id="' + canvasId + '" style="width: 100%; height: 100%; margin: 0; padding: 0;"></canvas>';
        body.appendChild(div);
    }

    // Bind to canvas
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
        throw SceneJS_error.fatalError(SceneJS.errors.CANVAS_NOT_FOUND,
            "SceneJS.Scene attribute 'canvasId' does not match any elements in the page");
    }
    this.canvasId = canvasId;

    /**
     * WebGL context options
     */
    this.options = options || {};

    this.canvas = (this.options.simulateWebGLContextLost)
        ? WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas)
        : canvas;

    this.resolutionScaling = this.options.resolutionScaling || 1;

    // If the canvas uses css styles to specify the sizes make sure the basic
    // width and height attributes match or the WebGL context will use 300 x 150

    this.canvas.width = this.canvas.clientWidth * this.resolutionScaling;
    this.canvas.height = this.canvas.clientHeight * this.resolutionScaling;

    /**
     * Attributes given when initialising the WebGL context
     */
    this.contextAttr = contextAttr || {};
    this.contextAttr.alpha = true;
    
    this.contextAttr["stencil"] = true;

    /**
     * The WebGL context
     */
    this.gl = null;

    /**
     * True when WebGL 2 support is enabled.
     *
     * @property webgl2
     * @type {Boolean}
     * @final
     */
    this.webgl2 = false; // Will set true in _initWebGL if WebGL is requested and we succeed in getting it.

    this.initWebGL();
};

/**
 * Names of recognised WebGL contexts
 */
SceneJS_Canvas.prototype._WEBGL_CONTEXT_NAMES = [
    "webgl",
    "experimental-webgl",
    "webkit-3d",
    "moz-webgl",
    "moz-glweb20"
];

/**
 * Initialise the WebGL context

 */
SceneJS_Canvas.prototype.initWebGL = function () {

    if (this.options.webgl2 !== false) {
        try {
            this.gl = this.canvas.getContext("webgl2", this.contextAttr);
        } catch (e) { // Try with next context name
        }
        if (!this.gl) {
            console.log('Failed to get a WebGL 2 context - defaulting to WebGL 1.');
        } else {
            this.webgl2 = true;
        }
    }

    if (!this.gl) {
        for (var i = 0; !this.gl && i < this._WEBGL_CONTEXT_NAMES.length; i++) {
            try {
                this.gl = this.canvas.getContext(this._WEBGL_CONTEXT_NAMES[i], this.contextAttr);
            } catch (e) { // Try with next context name
            }
        }
    }

    if (!this.gl) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.WEBGL_NOT_SUPPORTED,
            'Failed to get a WebGL context');
    }
};


/**
 * Simulate a lost WebGL context.
 * Only works if the simulateWebGLContextLost was given as an option to the canvas' constructor.
 */
SceneJS_Canvas.prototype.loseWebGLContext = function () {
    if (this.options.simulateWebGLContextLost) {
        this.canvas.loseContext();
    }
};

/**
 * Set canvas size multiplier for supersample anti-aliasing
 */
SceneJS_Canvas.prototype.setResolutionScaling = function (resolutionScaling) {
    this.resolutionScaling = resolutionScaling;
    this.canvas.width = this.canvas.clientWidth * resolutionScaling;
    this.canvas.height = this.canvas.clientHeight * resolutionScaling;
};


