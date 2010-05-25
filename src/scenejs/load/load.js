/**
 * @class A scene node that asynchronously loads its subgraph from a server.
 * <p>This basic SceneJS.Load type loads a JavaScript file that decribes content through the SceneJS API.
 * Subclasses of this (such as {@link SceneJS.LoadCollada} extend it to load other file types.</p>
 * <p>The node has six states it can be in, which may be queried with {@link #getState}:</p>
 * <ul><li>{@link #STATE_INITIAL} in which it is about to make an asynchronous request for the content.</li>
 * <li>{@link #STATE_LOADING} in which it has made the request and is awaiting the response, which it will receive
 * at any time, either within a scene render or between scene renders. In this state it has nothing to render
 * and will pass scene traversal on to its next sibling.</li>
 * <li>{@link #STATE_LOADED} in which it has successfully received its content and parsed it into a subgraph.
 * From here the node will transition to {@link #STATE_RENDERED} as soon as the subgraph has been rendered
 * and traversal has arrived back at this node on the way back up the graph. It may instead transition back
 * to {@link #STATE_INITIAL} as soon as it has not been rendered in a while and has then had its subgraph destroyed
 * by SceneJS to reclaim memory.</li>
 * <li>{@link #STATE_RENDERED} in which it has successfully received its content, parsed it into a subgraph, and been rendered
 * at least once. From here the node will transition back to {@link #STATE_INITIAL} as soon as it has not been rendered in
 * a while and has then had its subgraph destroyed by SceneJS to reclaim memory.</li>
 * <li>{@link #STATE_FREED} in which it has been dormant too long and SceneJS has reclaimed memory by destroying
 * the subgraph. When next rendered, it will then repeat its load request and transition
 * to {@link #STATE_LOADING}.</li>
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
 *
 * @events
 * @extends SceneJS.Node
 * @constructor
 * Creates a new SceneJS.Load
 *  @param {Object} [cfg] Static configuration object
 * @param {String} cfg.uri URI of file to load
 * @param {int} [cfg.timeoutSecs] Timeout - falls back on any loadTimoutSecs that was configured on the {@link SceneJS.Scene}
 * at the root of the scene graph, or the default 180 seconds if none configured there
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
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

/**
 * @name SceneJS.Load#state-changed
 * @event
 * Fires when the node changes state
 * @param @param {Object} e
 * @param {Boolean} [e.withIce=false]
 */
SceneJS._inherit(SceneJS.Load, SceneJS.Node);


/**
 * State in which load has failed. This can be either due to HTTP error (eg. HTTP 404) or
 * failure to parse the response. The node will now be permanently inactive and stuck in this state.
 * @const
 */
SceneJS.Load.STATE_ERROR = -1;

/**
 * State in which load is pending because node has not been rendered yet and hence has
 * not made its load request yet. When next rendered, it will then make its load request
 * and transition to {@link #STATE_LOADING}.
 * @const
 */
SceneJS.Load.STATE_INITIAL = 0;

/**
 * State in which node is awaiting a response to its load request. When the response arrives (asyncronously, ie.
 * either during or between scene renders), the node will then transition to  either {@link #STATE_LOADED}
 * or {@link #STATE_ERROR}, depending on whether or not it successfully parses the response. If the
 * response does not arrive or parse within the timeout period (180 seconds by default, unless configured) it will
 * transition to {@link STATE_ERROR}.
 * @const
 */
SceneJS.Load.STATE_LOADING = 1;

/**
 * State in which node has successfully received its content and parsed it into a subgraph.
 * From here the node will transition to {@link #STATE_RENDERED} as soon as the subgraph has been rendered
 * and traversal has arrived back at this node on the way back up the graph.
 * @const
 */
SceneJS.Load.STATE_LOADED = 2;

/**
 * State in which node has successfully received its content, parsed it into a subgraph, and been rendered
 * at least once. From here the node will transition back to {@link #STATE_INITIAL} as soon as it has not been rendered in
 * a while and has then had its subgraph destroyed by SceneJS to reclaim memory.
 * @const
 */
SceneJS.Load.STATE_RENDERED = 3;

/**
 * State in which load is pending after node has had its subgraph destroyed by SceneJS to reclaim memory after
 * not having been rendered for some time (Eg. is within a {@link SceneJS.Boundary} that has
 * not intersected the view frustum for a while, or perhaps within a {@link SceneJS.Selector} that has
 * not selected it lately). When next rendered, it will then repeat its load request and transition
 * to {@link #STATE_LOADING}.
 * @const
 */
SceneJS.Load.STATE_FREED = 4;

/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL}, {@link #STATE_LOADING},
 * {@link #STATE_LOADED}, {@link #STATE_FREED} and {@link #STATE_ERROR}.
 * @returns {int} The state
 */
SceneJS.Load.prototype.getState = function() {
    return this._state;
};

// @private
SceneJS.Load.prototype._init = function(params) {
    if (!params.uri) {
        throw SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.Load parameter expected: uri"));
    }
    this._uri = params.uri;
    this._loadTimeoutSecs = params._loadTimeoutSecs;
};

// @private
SceneJS.Load.prototype._visitSubgraph = function(data) {

    /* After completion of the right-to-left, depth-first traversal of the Load node's imported subgraph,
     * we'll render as an appendum the explicitly defined children of the Load node. So we'll configure
     * the traversal context (which tracks various states during graph traversal) with the appended children.
     * See _renderNodes for more details on how all that works.
     */
    var traversalContext = {
        appendix : this._children // Load node's children become those of right-most leaf node
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
    var oldState = this._state;
    this._state = newState;
    this._fireEvent("state-changed", { oldState: oldState, newState: newState });
};

// @private
SceneJS.Load.prototype._render = function(traversalContext, data) {
    if (!this._uri) {     // One-shot dynamic config
        this._init(this._getParams(data));
    }
    if (this._state == SceneJS.Load.STATE_LOADED || this._state == SceneJS.Load.STATE_RENDERED) {
        if (!SceneJS_loadModule.getAsset(this._handle)) { // evicted from cache - must reload
            this._changeState(SceneJS.Load.STATE_FREED);
        }
    }

    switch (this._state) {

        case SceneJS.Load.STATE_RENDERED:
            this._visitSubgraph(data);
            break;

        case SceneJS.Load.STATE_LOADED:
            this._visitSubgraph(data);
            this._changeState(SceneJS.Load.STATE_RENDERED);
            break;

        case SceneJS.Load.STATE_LOADING:
            break;

        case SceneJS.Load.STATE_INITIAL:
        case SceneJS.Load.STATE_FREED:
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
 *  @param {Object} [cfg] Static configuration object
 * @param {String} cfg.uri URI of file to load
 * @param {int} [cfg.timeoutSecs] Timeout - falls back on any loadTimoutSecs that was configured on the {@link SceneJS.Scene}
 * at the root of the scene graph, or the default 180 seconds if none configured there
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Load}
 */
SceneJS.load = function() {
    var n = new SceneJS.Load();
    SceneJS.Load.prototype.constructor.apply(n, arguments);
    return n;
};
