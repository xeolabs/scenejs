/**
 * @class The root node of a scenegraph
 * @extends SceneJS.Node
 *
 */

SceneJS.Scene = SceneJS_NodeFactory.createNodeType("scene");

SceneJS.Scene.prototype._init = function (params) {

    if (params.tagMask) {
        this.setTagMask(params.tagMask);
    }

    this._tagSelector = null;

    /**
     * Set false when canvas is to be transparent.
     * @type {boolean}
     */
    this.transparent = (params.transparent === true);

    /**
     * Tracks statistics within this engine, such as numbers of
     * scenes, textures, geometries etc.
     *
     * @property stats
     * @type {*}
     * @final
     */
    this.stats = this._engine.stats;
};


/**
 * Simulate a lost WebGL context for testing purposes.
 * Only works if the simulateWebGLLost was given as an option to {@link SceneJS.createScene}.
 */
SceneJS.Scene.prototype.loseWebGLContext = function () {
    this._engine.loseWebGLContext();
};


/**
 * Returns the HTML canvas for this scene
 * @return {HTMLCanvas} The canvas
 */
SceneJS.Scene.prototype.getCanvas = function () {
    return this._engine.canvas.canvas;
};

/**
 * Returns the WebGL context for this scene
 */
SceneJS.Scene.prototype.getGL = function () {
    return this._engine.canvas.gl;
};

/**
 * True if WebGL 2 is supported
 */
SceneJS.Scene.prototype.getWebGL2Supported = function () {
    return this._engine.canvas.webgl2;
};

/** Returns the Z-buffer depth in bits of the webgl context that this scene is to bound to.
 */
SceneJS.Scene.prototype.getZBufferDepth = function () {
    var gl = this._engine.canvas.gl;
    return gl.getParameter(gl.DEPTH_BITS);
};

/**
 * Set canvas size multiplier for supersample anti-aliasing
 */
SceneJS.Scene.prototype.setResolutionScaling = function (resolutionScaling) {
    return this._engine.canvas.setResolutionScaling(resolutionScaling);
};

/**
 * Sets a regular expression to select which of the scene subgraphs that are rooted by {@link SceneJS.Tag} nodes are included in scene renders
 * @param {String} [tagMask] Regular expression string to match on the tag attributes of {@link SceneJS.Tag} nodes. Nothing is selected when this is omitted.
 * @see #getTagMask
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setTagMask = function (tagMask) {
    tagMask = tagMask || "XXXXXXXXXXXXXXXXXXXXXXXXXX"; // HACK to select nothing by default
    if (!this._tagSelector) {
        this._tagSelector = {};
    }
    this._tagSelector.mask = tagMask;
    this._tagSelector.regex = tagMask ? new RegExp(tagMask) : null;
    this._engine.display.selectTags(this._tagSelector);
};

/**
 * Gets the regular expression which will select which of the scene subgraphs that are rooted by {@link SceneJS.Tag} nodes are included in scene renders
 * @see #setTagMask
 * @see SceneJS.Tag
 * @returns {String} Regular expression string that will be matched on the tag attributes of {@link SceneJS.Tag} nodes
 */
SceneJS.Scene.prototype.getTagMask = function () {
    return this._tagSelector ? this._tagSelector.mask : null;
};

/**
 * Sets the number of times this scene is drawn on each render.
 *
 * <p>This is useful for when we need to do things like render for left and right eyes.</p>
 *
 * @param {Number} numPasses The number of times the scene is drawn on each frame.
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setNumPasses = function (numPasses) {
    this._engine.setNumPasses(numPasses);
};

/**
 *  When doing multiple passes per frame, specifies whether to clear the
 * canvas before each pass (true) or just before the first pass (false).
 *
 * <p>This is useful for when we need to do things like render a separate pass to a stereo framebuffer for left and right eyes,
 * where we want to clear the buffer before each pass.</p>
 *
 * @param {Boolean} clearEachPass Tryu to clear before each pass (default is false).
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setClearEachPass = function (clearEachPass) {
    this._engine.setClearEachPass(clearEachPass);
};

/**
 * Sets a custom framebuffer to bind for render passes.
 *
 * @param {Function} bindOutputFrameBuffer Callback to bind framebuffer
 * @param {Function} unbindOutputFrameBuffer Callback to unbind framebuffer
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setBindOutputFrameBuffer = function (bindOutputFrameBuffer, unbindOutputFrameBuffer) {
    this._engine.display.bindOutputFramebuffer = bindOutputFrameBuffer;
    this._engine.display.unbindOutputFramebuffer = unbindOutputFrameBuffer;
};

/**
 * Render a single frame if new frame pending, or force a new frame
 * Returns true if frame rendered
 */
SceneJS.Scene.prototype.renderFrame = function (params) {
    return this._engine.renderFrame(params);
};

/**
 * Prevent re-compilation of scene graph.
 */
SceneJS.Scene.prototype.pauseCompilation = function () {
    return this._engine.pauseCompilation();
};

/**
 * Resume re-compilation of scene graph.
 */
SceneJS.Scene.prototype.resumeCompilation = function () {
    return this._engine.resumeCompilation();
};

/**
 * Force compilation of the scene graph.
 */
SceneJS.Scene.prototype.compile = function () {
    return this._engine.compile();
};

/**
 * Signals that a new frame will be needed
 * @param params
 */
SceneJS.Scene.prototype.needFrame = function () {
    this._engine.display.imageDirty = true;
};

/**
 * Starts the render loop for this scene
 */
SceneJS.Scene.prototype.start = function (params) {
    this._engine.start(params);
};

/**
 * Set refresh rate for the scene
 */
SceneJS.Scene.prototype.setFPS = function (fps) {
    this._engine.fps = fps;
};

/**
 * Pauses/unpauses current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 * @param {Boolean} doPause Indicates whether to pause or unpause the render loop
 */
SceneJS.Scene.prototype.pause = function (doPause) {
    this._engine.pause(doPause);
};

/**
 * Returns true if the scene's render loop is currently running.
 * @returns {Boolean} True when scene render loop is running
 */
SceneJS.Scene.prototype.isRunning = function () {
    return this._engine.running;
};

/**
 *
 */
SceneJS.Scene.prototype.pick = function (params) {
    var result = this._engine.pick(params);
    this.renderFrame({force: true }); // HACK: canvas blanks after picking
    if (result) {
        this.publish("pick", result);
        return result;
    } else {
        this.publish("nopick");
    }
};


/**
 * Reads colors of pixels from the last rendered frame.
 *
 * <p>Call this method like this:</p>
 *
 * <pre>
 *
 * // Ignore transparent pixels (default is false)
 * var opaqueOnly = true;
 *
 * #readPixels([
 *      { x: 100, y: 22,  r: 0, g: 0, b: 0 },
 *      { x: 120, y: 82,  r: 0, g: 0, b: 0 },
 *      { x: 12,  y: 345, r: 0, g: 0, b: 0 }
 * ], 3, opaqueOnly);
 * </pre>
 *
 * Then the r,g,b components of the entries will be set to the colors at those pixels.
 */
SceneJS.Scene.prototype.readPixels = function (entries, size, opaqueOnly) {
    return this._engine.readPixels(entries, size, opaqueOnly);
};

/**
 * Scene node's destroy handler, called by {@link SceneJS_node#destroy}
 * @private
 */
SceneJS.Scene.prototype._destroy = function () {
    if (!this.destroyed) {
        delete SceneJS._engines[this.id];  // HACK: circular dependency
        SceneJS._engineIds.removeItem(this.id); // HACK: circular dependency
        this.destroyed = true;
    }
};

/**
 * Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
 * when you render it.
 */
SceneJS.Scene.prototype.isActive = function () {
    return !this._engine.destroyed;
};

/**
 * Stops current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 */
SceneJS.Scene.prototype.stop = function () {
    this._engine.stop();
};

/** Determines if node exists in this scene
 * @deprecated
 */
SceneJS.Scene.prototype.containsNode = function (nodeId) {
    return !!this._engine.findNode(nodeId);
};

/**
 * Finds nodes in this scene that have nodes IDs matching the given regular expression
 *
 * @param {String} nodeIdRegex Regular expression to match on node IDs
 * @return {[SceneJS.Node]} Array of nodes whose IDs match the given regex
 */
SceneJS.Scene.prototype.findNodes = function (nodeIdRegex) {
    return this._engine.findNodes(nodeIdRegex);
};

/**
 * Finds the node with the given ID in this scene
 * @deprecated
 * @param {String} nodeId Node ID
 * @param {Function} callback Callback through which we'll get the node asynchronously if it's being instantiated on-demand from a node type plugin
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS.Scene.prototype.findNode = function (nodeId, callback) {
    return this.getNode(nodeId, callback);
};

/**
 * @function Finds the node with the given ID in this scene
 * @param {String} nodeId Node ID
 * @param {Function} callback Callback through which we'll get the node asynchronously if it's being instantiated on-demand from a node type plugin
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS.Scene.prototype.getNode = function (nodeId, callback) {
    var node = this._engine.findNode(nodeId);
    if (node) {
        if (callback) {
            callback(node);
        }
        return node;
    } else {
        if (!callback) {
            return null;
        }
        // Subscribe to instantiation of node from plugin
        this.once("nodes/" + nodeId, callback);
    }
};

/**
 * Tests whether a node core of the given ID exists for the given node type
 * @param {String} type Node type
 * @param {String} coreId
 * @returns Boolean
 */
SceneJS.Scene.prototype.hasCore = function (type, coreId) {
    return this._engine.hasCore(type, coreId);
};

/**
 * Enable or disable depth sorting
 */
SceneJS.Scene.prototype.setDepthSort = function (enabled) {
    this._engine.setDepthSort(enabled);
};

/**
 * Returns the current status of this scene.
 *
 * When the scene has been destroyed, the returned status will be a map like this:
 *
 * {
 *      destroyed: true
 * }
 *
 * Otherwise, the status will be:
 *
 * {
 *      numTasks: Total number of asset loads (eg. texture, geometry stream etc.) currently in progress for this scene
 * }
 *
 */
SceneJS.Scene.prototype.getStatus = function () {
    var sceneStatus = SceneJS_sceneStatusModule.sceneStatus[this.id];
    if (!sceneStatus) {
        return {
            destroyed: true
        };
    }
    return SceneJS._shallowClone(sceneStatus);
};
