/**
 *
 */
var SceneJS_Canvas = function(canvasId, contextAttr, options) {

    /**
     * ID of this canvas
     */
    this.canvasId = canvasId;

    /**
     * WebGL context options
     */
    this.options = options || {};

    /**
     * The HTML canvas element
     */
    var canvas = document.getElementById(canvasId);

    if (!canvas) {
        throw SceneJS_error.fatalError(SceneJS.errors.CANVAS_NOT_FOUND,
                "SceneJS.Scene attribute 'canvasId' does not match any elements in the page");
    }

    this.canvas = (this.options.simulateWebGLContextLost)
            ? WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas)
            : canvas;

    // If the canvas uses css styles to specify the sizes make sure the basic
    // width and height attributes match or the WebGL context will use 300 x 150

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    /**
     * Attributes given when initialising the WebGL context
     */
    this.contextAttr = contextAttr;

    /**
     * The WebGL context
     */
    this.gl = null;

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
SceneJS_Canvas.prototype.initWebGL = function() {

    for (var i = 0; !this.gl && i < this._WEBGL_CONTEXT_NAMES.length; i++) {
        try {
            this.gl = this.canvas.getContext(this._WEBGL_CONTEXT_NAMES[i], this.contextAttr);

        } catch (e) { // Try with next context name
        }
    }

    if (!this.gl) {
        throw SceneJS_error.fatalError(
                SceneJS.errors.WEBGL_NOT_SUPPORTED,
                'Failed to get a WebGL context');
    }

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.depthRange(0, 1);
    this.gl.disable(this.gl.SCISSOR_TEST);
};


/**
 * Simulate a lost WebGL context.
 * Only works if the simulateWebGLContextLost was given as an option to the canvas' constructor.
 */
SceneJS_Canvas.prototype.loseWebGLContext = function() {
    if (this.options.simulateWebGLContextLost) {
        this.canvas.loseContext();
    }
};