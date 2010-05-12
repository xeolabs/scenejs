/**
 * @class A scene node that asynchronously loads JavaScript content for its subgraph from a server.
 * <p>This node is configured with the
 * location of a JavaScript file containing a SceneJS definition of the subgraph. When first visited during scene
 * traversal, it will begin the load and allow traversal to continue at its next sibling node. When on a subsequent
 * visit its subgraph has been loaded, it will then allow traversal to descend into that subgraph to render it.</p>
 * <p><b>Loading Cross-Domain</b></p>
 * <p>When the {@link SceneJS.Scene} node is configured with the URL of a SceneJS JSON proxy server, you can perform the
 * load cross-domain. Otherwise, the URL of the content must be at the same domain as the scene definition's JavaScript file
 * in order to not violate the browser' same-domain security policy.
 * <a target="other" href="http://scenejs.org/library/v0.7/proxies/jsonp_proxy.pl">Here is a download of </a>an example of a SceneJS
 * JSONP proxy script written in Perl.</p>
 * <p><b>Monitoring Load Progress</b></p>
 * <p>You can monitor loads by registering "process-started" and "process-killed" listeners with {@link SceneJS.onEvent()}.</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-asset-load">Example 1</a></li>
 * </ul>
 * <p><b>Usage Example</b></p><p>The SceneJS.Load node shown below loads a fragment of JavaScript-defined scene
 * definition cross-domain, via the JSONP proxy located by the <b>uri</b> property on the {@link SceneJS.Scene} node.</b></p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({
 *
 *       // JSONP proxy location - needed only for cros-domain load
 *       proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" });
 *
 *       new SceneJS.Load({
 *                 uri:"http://foo.com/my-asset.js"
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
    this._state = SceneJS.Load.prototype._STATE_INITIAL;
};

SceneJS._inherit(SceneJS.Load, SceneJS.Node);

// @private
SceneJS.Load.prototype._STATE_ERROR = -1;         // Asset load or texture creation failed

// @private
SceneJS.Load.prototype._STATE_INITIAL = 0;        // Ready to start load

// @private
SceneJS.Load.prototype._STATE_LOADING = 1;        // Load in progress

// @private
SceneJS.Load.prototype._STATE_LOADED = 2;         // Load completed

// @private
SceneJS.Load.prototype._STATE_ATTACHED = 3;       // Subgraph integrated

// @private
SceneJS.Load.prototype._init = function(params) {
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.Load parameter expected: uri"));
    }
    this._uri = params.uri;
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
SceneJS.Load.prototype._render = function(traversalContext, data) {
    if (!this._uri) {
        this._init(this._getParams(data));
    }
    if (this._state == this._STATE_ATTACHED) {
        if (!SceneJS_loadModule.getAsset(this._handle)) { // evicted from cache - must reload
            this._state = this._STATE_INITIAL;
        }
    }
    switch (this._state) {
        case this._STATE_ATTACHED:
            this._visitSubgraph(data);
            break;

        case this._STATE_LOADING:
            break;

        case this._STATE_LOADED:
            SceneJS_loadModule.assetLoaded(this._handle);  // Finish loading - kill process
            this._state = this._STATE_ATTACHED;
            this._visitSubgraph(data);
            break;

        case this._STATE_INITIAL:
            this._state = this._STATE_LOADING;

            /* Asset not currently loaded or loading - load it
             */
            var _this = this;
            this._handle = SceneJS_loadModule.loadAsset(// Process killed automatically on error or abort
                    this._uri,
                    this._serverParams || {
                        format: "scenejs"
                    },
                    this._parse,
                    function(asset) { // Success
                        _this._assetNode = asset;   // Asset is wrapper created by SceneJS.createNode
                        _this._state = _this._STATE_LOADED;
                    },
                    function() { // onTimeout
                        _this._state = _this._STATE_ERROR;
                        SceneJS_errorModule.error(
                                new SceneJS.LoadTimeoutException("Load timed out - uri: " + _this._uri));
                    },
                    function(e) { // onError - SceneJS_loadModule has killed process
                        _this._state = _this._STATE_ERROR;
                        e.message = "Load failed - " + e.message + " - uri: " + _this._uri;
                        SceneJS_errorModule.error(e);
                    });
            break;

        case this._STATE_ERROR:
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
