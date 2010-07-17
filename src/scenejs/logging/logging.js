/**
 * @class A scene node that allows you to intercept SceneJS logging at selected points within your scene graph.
 * <p><b>Example Usage</b></p><p>Routing all logging within a given subgraph to alert popups:</b></p><pre><code>
 * var node = new SceneJS.Node(
 *
 *    // ...some nodes ...
 *
 *    new SceneJS.Logging({
 *           error: function(msg) {
 *                alert("Error at global logger: " + msg);
 *           },
 *
 *           warn: function(msg) {
 *               alert("Warning at global logger: " + msg);
 *           },
 *
 *           debug: function(msg) {
 *               alert("Debug at global logger: " + msg);
 *           },
 *
 *           info: function(msg) {
 *               alert("Info at global logger: " + msg);
 *           }
 *       },
 *
 *       // ... sub-nodes we are in interesting
 *       //        intercepting logs from here ...
 *    )
 * );
 *
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Logging
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Logging = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "logging";
    this._funcs = {};
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Logging, SceneJS.Node);

/**
 * Sets functions
 *
 * @param {object} funcs - object cntaining functions - see class comment for example
 * @returns {SceneJS.Logging} This logging node
 */
SceneJS.Logging.prototype.setFuncs = function(funcs) {
    if (funcs.warn) {
        this._funcs.warn = funcs.warn;
    }
    if (funcs.error) {
        this._funcs.error = funcs.error;
    }
    if (funcs.debug) {
        this._funcs.debug = funcs.debug;
    }
    if (funcs.info) {
        this._funcs.info = funcs.info;
    }
    return this;
};

/**
 Returns logging functions
 @returns {object} The functions
 */
SceneJS.Logging.prototype.getFuncs = function() {
    return {
        warn : this._funcs.warn,
        error : this._funcs.error,
        debug : this._funcs.debug,
        info : this._funcs.info
    };
};

// @private
SceneJS.Logging.prototype._init = function(params) {
    this.setFuncs(params);
};

// @private
SceneJS.Logging.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    var prevFuncs = SceneJS._loggingModule.getFuncs();
    SceneJS._loggingModule.setFuncs(this._funcs);
    this._renderNodes(traversalContext, data);
    SceneJS._loggingModule.setFuncs(prevFuncs);
};

/** Returns a new SceneJS.Logging instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Logging constructor
 * @returns {SceneJS.Logging}
 */
SceneJS.logging = function() {
    var n = new SceneJS.Logging();
    SceneJS.Logging.prototype.constructor.apply(n, arguments);
    return n;
};