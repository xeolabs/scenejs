/**
 * @class The root node of a scenegraph
 * @extends SceneJS.Node
 *
 */

SceneJS.Scene = SceneJS_NodeFactory.createNodeType("scene");

SceneJS.Scene.prototype._init = function(params) {

    if (params.tagMask) {
        this.setTagMask(params.tagMask);
    }

    this._tagSelector = null;
};

/**
 * Subscribes to an event on this scene
 *
 * @param {String} type Event type
 * @param {Function} callback Callback that will be called with the event parameters
 * @return {String} handle Handle to the subcription
 */
SceneJS.Scene.prototype.onEvent = function(type, callback) {
    return this._engine.events.onEvent(type, callback);
};

/**
 * Unsubscribes to an event previously subscribed to on scene
 *
 * @param {String} handle Subscription handle
 */
SceneJS.Scene.prototype.unEvent = function(handle) {
    this._engine.events.unEvent(handle);
};

/**
 * Simulate a lost WebGL context for testing purposes.
 * Only works if the simulateWebGLLost was given as an option to {@link SceneJS.createScene}.
 */
SceneJS.Scene.prototype.loseWebGLContext = function() {
    this._engine.loseWebGLContext();
};


/**
 * Returns the HTML canvas for this scene
 * @return {HTMLCanvas} The canvas
 */
SceneJS.Scene.prototype.getCanvas = function() {
    return this._engine.canvas.canvas;
};

/**
 * Returns the WebGL context for this scene
 */
SceneJS.Scene.prototype.getGL = function() {
    return this._engine.canvas.gl;
};

/** Returns the Z-buffer depth in bits of the webgl context that this scene is to bound to.
 */
SceneJS.Scene.prototype.getZBufferDepth = function() {

    var gl = this._engine.canvas.gl;

    return gl.getParameter(gl.DEPTH_BITS);
};

/**
 * Sets a regular expression to select which of the scene subgraphs that are rooted by {@link SceneJS.Tag} nodes are included in scene renders
 * @param {String} tagMask Regular expression string to match on the tag attributes of {@link SceneJS.Tag} nodes
 * @see #getTagMask
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setTagMask = function(tagMask) {

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
SceneJS.Scene.prototype.getTagMask = function() {
    return this._tagSelector ? this._tagSelector.mask : null;
};

/**
 * Render a single frame if new frame pending, or force a new frame
 * Returns true if frame rendered
 */
SceneJS.Scene.prototype.renderFrame = function(params) {
    return this._engine.renderFrame(params);
};

/**
 * Starts the render loop for this scene
 */
SceneJS.Scene.prototype.start = function(params) {
    this._engine.start(params);
};

/**
 * Pauses/unpauses current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 * @param {Boolean} doPause Indicates whether to pause or unpause the render loop
 */
SceneJS.Scene.prototype.pause = function(doPause) {
    this._engine.pause(doPause);
};

/**
 * Returns true if the scene's render loop is currently running.
 * @returns {Boolean} True when scene render loop is running
 */
SceneJS.Scene.prototype.isRunning = function() {
    return this._engine.running;
};

/**
 * Picks whatever geometry will be rendered at the given canvas coordinates.
 */
SceneJS.Scene.prototype.pick = function(canvasX, canvasY, options) {
    return this._engine.pick(canvasX, canvasY, options);
};

/**                                  p
 * Scene node's destroy handler, called by {@link SceneJS_node#destroy}
 * @private
 */
SceneJS.Scene.prototype.destroy = function() {

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
SceneJS.Scene.prototype.isActive = function() {
    return !this._engine.destroyed;
};

/**
 * Stops current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 */
SceneJS.Scene.prototype.stop = function() {
    this._engine.stop();
};

/** Determines if node exists in this scene
 */
SceneJS.Scene.prototype.containsNode = function(nodeId) {
    return !!this._engine.findNode(nodeId);
};

/**
 * Finds nodes in this scene that have nodes IDs matching the given regular expression
 *
 * @param {String} nodeIdRegex Regular expression to match on node IDs
 * @return {[SceneJS.Node]} Array of nodes whose IDs match the given regex
 */
SceneJS.Scene.prototype.findNodes = function(nodeIdRegex) {
    return this._engine.findNodes(nodeIdRegex);
};

/**
 * Finds the node with the given ID in this scene
 * @deprecated
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS.Scene.prototype.findNode = function(nodeId) {
    return this._engine.findNode(nodeId);
};

/**
 * @function Finds the node with the given ID in this scene
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS.Scene.prototype.getNode  = function(nodeId) {
    return this._engine.findNode(nodeId);
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
 *      numLoading: Number // Number of asset loads (eg. texture, geometry stream etc.) currently in progress
 * }
 *
 */
SceneJS.Scene.prototype.getStatus = function() {
    return (this._engine.destroyed)
            ? { destroyed: true }
            : SceneJS._shallowClone(SceneJS_sceneStatusModule.sceneStatus[this.id]);
};
