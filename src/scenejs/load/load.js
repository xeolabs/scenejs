/**
 * @class A scene node that asynchronously loads its subgraph from a server.
 * <p>This basic SceneJS.Load type loads a JavaScript file that decribes content through the SceneJS API.
 * Subclasses of this (such as {@link SceneJS.LoadCollada} extend it to load other file types.</p>
 * <p>The node has four states it can be in, which may be queried with {@link #getState}:</p>
 * <ul><li>{@link #STATE_INITIAL} in which it is about to make an asynchronous request for the content.</li>
 * <li>{@link #STATE_LOADING} in which it has made the request and is awaiting the response, which it will receive
 * at any time, either within a scene render or between scene renders. In this state it has nothing to render
 * and will pass scene traversal on to its next sibling.</li>
 * <li>{@link #STATE_LOADED} in which it has successfully received and parsed a response and created its subgraph. In this state
 * it may potentially transition to {@link #STATE_INITIAL} if it has been dormant too long and SceneJS has reclaimed
 * memory by destroying the subgraph.</li>
 * <li>{@link #STATE_ERROR} if SceneJS has permanently inactivated the node after load failed</li></ul>
 * <p><b>Loading Cross-Domain</b></p>
 * <p>When the {@link SceneJS.Scene} node at the root of the scene graph is configured with the URL of a
 * SceneJS JSON proxy server, this node can load content cross-domain. Otherwise, the URL of the content must be at the
 * same domain as the scene definition's JavaScript file in order to not violate the browser's same-domain security
 * policy. <a target="other" href="http://scenejs.org/library/v0.7/proxies/jsonp_proxy.pl">Here is a download of </a>an example of a SceneJS
 * JSONP proxy script written in Perl.</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-asset-load">Example 1</a></li>
 * </ul>
 * <p><b>Usage Example</b></p><p>The SceneJS.Load node shown below loads a fragment of JavaScript-defined scene
 * definition cross-domain, via the JSONP proxy located by the <b>loadProxy</b> property on the {@link SceneJS.Scene} node.</b></p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({
 *
 *       // JSONP proxy location - needed only for cros-domain load
 *
 *       loadProxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" });
 *
 *       new SceneJS.Load({
 *                 uri : "http://foo.com/my-asset.js",
 *
 *              // Optional timeout - falls back on any loadTimoutSecs that was configured on the
 *              // SceneJS.Scene at the root of the scene graph, or the default 180 seconds if
 *              // none configured there
 *
 *                 loadTimeoutSecs : 180
 *            })
 *  );
 *  </pre></code>
 * @extends SceneJS.Node
 *  @constructor
 *  Create a new SceneJS.Load
 *  @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Load = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "load";
    this._uri = null;
    this._assetParams = null;
    this._parser = null;
    this._assetNode = null;
    this._handle = null;
    this._state = SceneJS.Load.STATE_INITIAL;
    this._loadTimoutSecs = null;  // default while null
};

SceneJS._inherit(SceneJS.Load, SceneJS.Node);

/**
 * State in which load has failed. This can be either due to HTTP error (eg. HTTP 404) or
 * failure to parse the response. The node will now be permanently inactive and stuck in this state.
 */
SceneJS.Load.STATE_ERROR = -1;

/**
 * State in which load is pending. This is either because 1) it has not been rendered yet and hence has
 * not made its load request yet, or 2) has had its subgraph destroyed by SceneJS to reclaim memory after
 * not having been rendered for some time (Eg. is within a {@link SceneJS.Boundary} that has
 * not intersected the view frustum for a while, or perhaps within a {@link SceneJS.Selector} that has
 * not selected it lately). When next rendered, it will then make (or repeat) its load request
 * and transition to {@link #STATE_LOADING}.
 */
SceneJS.Load.STATE_INITIAL = 0;

/**
 * State in which node is awaiting a response to its load request. When the response arrives (asyncronously, ie.
 * either during or between scene renders), the node will then transition to  either {@link #STATE_LOADED}
 * or {@link #STATE_ERROR}, depending on whether or not it successfully parses the response. If the
 * response does not arrive or parse within the timeout period (180 seconds by default, unless configured) it will
 * transition to {@link STATE_ERROR}.
 */
SceneJS.Load.STATE_LOADING = 1;

/**
 * State in which node has successfully received its content and parsed it into a subgraph.
 * From here the node will transition back to {@link #STATE_INITIAL} as soon as it has not been rendered in
 * a while and has then had its subgraph destroyed by SceneJS to reclaim memory.
 */
SceneJS.Load.STATE_LOADED = 2;


/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL}, {@link #STATE_LOADING}, 
 * {@link #STATE_LOADED} and {@link #STATE_INITIAL}.
 * @returns {int} The state
 */
SceneJS.Load.prototype.getState = function() {
    return this._state;
};

// @private
SceneJS.Load.prototype._init = function(params) {
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.Load parameter expected: uri"));
    }
    this._uri = params.uri;
    this._loadTimeoutSecs = params._loadTimeoutSecs;
};

// @private
SceneJS.Load.prototype._visitSubgraph = function(data) {
    var traversalContext = {
        appendix : this._children
    };
    this._assetNode._render.call(this._assetNode, traversalContext, data);
};

/**
 * Parser callback to convert the response content into a SceneJS subgraph. For this SceneJS.Load base class,
 * the format of the data could be either raw JavaScript in the case of a same-domain load, or a pre-evaluated
 * SceneJS.Node or subtype for a cross-domain JSONP request.
 * @private
 */
SceneJS.Load.prototype._parse = function(data, onError) {
    if (data._render) {  // Cross-domain JSONP
        return data;
    }
    if (data.error) {
        onError(data.error);
    }
    try {
        var data = eval(data);  // Same-domain
        if (data.error) {
            onError(data.error);
        }
        return data;
    } catch (e) {
        onError("Error parsing response: " + e);
    }
};

// @private
SceneJS.Load.prototype._changeState = function(newState) {
    this._state = newState;
    this._fireEvent("state-changed", { state: newState });
};

// @private
SceneJS.Load.prototype._render = function(traversalContext, data) {
    if (!this._uri) {     // One-shot dynamic config
        this._init(this._getParams(data));
    }
    if (this._state == SceneJS.Load.STATE_LOADED) {
        if (!SceneJS_loadModule.getAsset(this._handle)) { // evicted from cache - must reload
            this._changeState(SceneJS.Load.STATE_INITIAL);
        }
    }
    switch (this._state) {
        case SceneJS.Load.STATE_LOADED:
            this._visitSubgraph(data);
            break;

        case SceneJS.Load.STATE_LOADING:
            break;

        case SceneJS.Load.STATE_INITIAL:
            var _this = this;
            this._changeState(SceneJS.Load.STATE_LOADING);
            this._handle = SceneJS_loadModule.loadAsset(// Process killed automatically on error or abort
                    this._uri,
                    this._loadTimeoutSecs, // default when null
                    this._serverParams || {
                        format: "scenejs"
                    },
                    this._parse,
                    function(asset) { // Success
                        _this._assetNode = asset;
                        SceneJS_loadModule.assetLoaded(_this._handle);
                        _this._changeState(SceneJS.Load.STATE_LOADED);
                    },
                    function() { // onTimeout
                        _this._changeState(SceneJS.Load.STATE_ERROR);
                        SceneJS_errorModule.error(
                                new SceneJS.LoadTimeoutException("Load timed out - uri: " + _this._uri));
                    },
                    function(e) { // onError - SceneJS_loadModule has killed process
                        _this._changeState(SceneJS.Load.STATE_ERROR);
                        e.message = "Load failed - " + e.message + " - uri: " + _this._uri;
                        SceneJS_errorModule.error(e);
                    });
            break;

        case SceneJS.Load.STATE_ERROR:
            break;
    }
};

/** Returns a new SceneJS.Load instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Load constructor
 * @returns {SceneJS.Load}
 */
SceneJS.load = function() {
    var n = new SceneJS.Load();
    SceneJS.Load.prototype.constructor.apply(n, arguments);
    return n;
};
