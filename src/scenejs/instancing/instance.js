/**
 * @class Causes an instance of a resource to be inserted into a scene graph.
 *
 * <p>The resource can come from the entire contents of a model file, a selected element in a model file, or from a
 * Symbol that has been previously rendered in the scene graph. For each of these cases, the Instance's uri parameter
 * will take a different form, as shown in these examples.</p>
 *
 * <p>To instance an entire model from a file, specify an absolute URI to the file with no fragment part. Here we're
 * instancing the default scene defined in a COLLADA file:</p>
 * <pre><code>
 * new SceneJS.Instance({
 *    uri: "http://foo.com/models/airplane.dae"
 * })
 * </code></pre>
 * <p>For some file formats, SceneJS allows you to instance a selected a resource (or "asset") from within them. Here
 * we're instancing a selected scene within a COLLADA file:</p>
 * <pre><code>
 * new SceneJS.Instance({
 *     uri: "http://foo.com/models/suburbia.dae#house_scene"
 * })
 * </code></pre>
 * <p>If we know that file is really big and will take longer than the default of 180 seconds to arrive, we can configure
 * our own timeout, in this case a generous six minutes:</p>
 *  <pre><code>
 * new SceneJS.Instance({
 *     uri: "http://foo.com/models/suburbia.dae#house_scene",
 *     loadTimeoutSecs: 360
 * })
 * </code></pre>
 * <p>When a Symbol has been rendered prior to the Instance during scene traversal, then the Instance may instantiate it
 * with a URI that contains only the fragment part, which will walk the SIDs (sub-identifiers) of previously rendered
 * nodes to resolve the Symbol. Here's the most trivial case - see how the fragment URI of the instance maps to the
 * Symbol's SID.<p>
 * <pre><code>
 * new SceneJS.Symbol({ sid: "myBox" },
 *    new SceneJS.objects.Cube()
 * ),
 *
 * new SceneJS.Instance( { uri: "myBox" })
 * </code></pre>
 * <p>Another case, in which an Instance resolves a Symbol that is within a namespace defined by the SID of a parent
 * node:</p>
 * <pre><code>
 * new SceneJS.Node({ sid: "mySymbols" },
 *     new SceneJS.Symbol({ sid: "myBox" },
 *         new SceneJS.objects.Cube()
 *     )
 * ),
 *
 * new SceneJS.Instance( { uri: "mySymbols/myBox" })
 * </code></pre>
 * <p>Think of these nested SIDs as directories, where the URI fragment part works works the same way as a directory
 * path. An absolute fragment path begins with a '/' - in the following example, if the node with the "moreSymbols" SID
 * is defined at the top level, we may then reference it with an absolute path:</p>
 * <pre><code>
 * new SceneJS.Node({ sid: "moreSymbols" },
 *     new SceneJS.Symbol({ sid: "myOtherBox" },
 *         new SceneJS.objects.Cube()
 *     )
 * ),
 *
 * new SceneJS.Instance( { uri: "/moreSymbols/myOtherBox" })
 * </code></pre>
 *
 * <p>For some model file formats, you can use an absolute URI with a fragment to instantiate hierarchically-organised
 * resources within them. When SceneJS loads a COLLADA model, for example, it will create Symbol nodes within SID
 * namespaces (as shown above) that will allow you to instantiate selected scenes. You can even instantiate a
 * selected COLLADA scene via one of its cameras: </p>
 *
 * </code></pre>
 * new SceneJS.Instance( {
 *     uri: "http://foo.com/models/suburbia.dae#house_scene/camera1"
 * });
 *
 * <h2>File Loading States</h2>
 * <p>When instancing content from a file, an Instance node must first perform an HTTP GET to load it. That is, unless
 * some other Instance has already loaded that file, in which case SceneJS will have internally cached a subgraph
 * parsed from that file.</p>
 *
 * <p>When instancing content from a file, an Instance node must first perform an HTTP GET to load it. That is, unless
 * some other Instance has already loaded that file, in which case SceneJS will have internally cached a subgraph
 * parsed from that file.</p>
 *
 * <p>Each Instance that must load a file will transition through six different states as its request is processed,
 * which may be queried through the Instance's {@link #getState} method:</p>
 * <ul><li>{@link #STATE_INITIAL} in which it is about to make an asynchronous request for the content.</li>
 * <li>{@link #STATE_LOADING} in which it has made the request and is awaiting the response, which it will receive
 * at any time, either within a scene render or between scene renders. In this state it has nothing to render
 * and will pass scene traversal on to its next sibling.</li>
 * <li>{@link #STATE_READY} in which it has successfully received its content and parsed it into a subgraph.
 * From here the node will transition to {@link #STATE_RENDERED} as soon as the subgraph has been rendered
 * and traversal has arrived back at this node on the way back up the graph. It may instead transition back
 * to {@link #STATE_INITIAL} as soon as it has not been rendered in a while and has then had its subgraph destroyed
 * by SceneJS to reclaim memory.</li>
 *  * <li>{@link #STATE_RENDERING} in which it has successfully loaded and parsed its target file or resolved its
 * target symbol and is about to render (instance) that target. From here the node will transition to
 * {@link #STATE_RENDERED} as soon as rendered its target.</li>
 * <li>{@link #STATE_RENDERED} in which it has successfully rendered its target at least once. If the target is a file,
 * then from here the node will transition back to {@link #STATE_INITIAL} as soon as the target has not been rendered in
 * a while and has been destroyed by SceneJS to reclaim memory.</li>
 * <li>{@link #STATE_FREED} in which it has been dormant too long and SceneJS has reclaimed memory by destroying
 * the subgraph. When next rendered, it will then repeat its load request and transition
 * to {@link #STATE_LOADING}.</li>
 * <li>{@link #STATE_ERROR} if SceneJS has permanently inactivated the node after load failed</li></ul>
 * <p>Note that when instantiating from a file that has been previously loaded by another Instance, it will transition
 * directly to {@link #STATE_RENDERED}.<p>
 *
 * <p><b>Loading Cross-Domain</b></p>
 * <p>When SceneJS is configured with a JSONP strategy via {@link SceneJS.setJSONPStrategy}, you can perform the
 * load cross-domain. Otherwise, the URL of the content must be at the same domain as the scene definition's JavaScript file
 * in order to not violate the browser' same-domain security policy.
 *
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-asset-load">Example 1</a></li>
 * </ul>
 *
 * @events
 * @extends SceneJS.Node
 * @constructor
 * Creates a new SceneJS.Instance
 *  @param {Object} [cfg] Static configuration object
 * @param {String} cfg.uri URI of file to load
 * @param {int} [cfg.timeoutSecs] Timeout - falls back on any loadTimoutSecs that was configured on the {@link SceneJS.Scene}
 * at the root of the scene graph, or the default 180 seconds if none configured there
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Instance = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "instance";
    this._uri = null;
    this._symbol = null;
    this._state = SceneJS.Instance.STATE_INITIAL;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Instance, SceneJS.Node);

/**
 * Initial state of a remote Instance, in which it has not been rendered yet and thus loading of its target file has not
 * yet begun. From here a remote Instance will transition to {@link #STATE_LOADING} as soon as it is first rendered.
 * @const
 */
SceneJS.Instance.STATE_INITIAL = 0;

/**
 * State of a local or remote-mode Instance in which instantiation has failed. For a remote instance this can be either
 * due to HTTP error (eg. HTTP 404) or failure to parse the response; in the assumption that the file is unavailable for
 * the remainder of the lifetime of the scene graph, a remote Instance will then remain fixed in this state. For a local
 * instance, this condition might be temporary (eg. the target Symbol is just not being rendered yet for some reason),
 * so a local Instance will then try instancing again when next rendered, transitioning to {@link STATE_RENDERING} when
 * that succeeds.
 * @const
 */
SceneJS.Instance.STATE_ERROR = -1;

/**
 * State of a local or remote Instance in which it will attempt to instantiate its target when next rendered. For a
 * remote Instance, this is when it has successfully loaded its target file and parsed it into a subgraph. For a local
 * Instance, this is when it is ready to attempt aquisition of its target Symbol. From here, a remote node will
 * transition to {@link #STATE_RENDERING} and instantiates its target when next rendered. A local Instance will do
 * the same when next rendered, providing it succeeds in finding its target Symbol, otherwise the local Instance will
 * transition to {@link #STATE_ERROR}.
 * target.
 * @const
 */
SceneJS.Instance.STATE_READY = 2;


/**
 * State of a local or remote Instance in which it is rendering its target. While in this state, you can
 * obtain its target subgraph through its getTarget() method. From this state, the Instance will transition to
 * {@link #STATE_READY} once it has completed rendering the target.
 * @const
 */
SceneJS.Instance.STATE_RENDERING = 3;

/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL},
 * {@link #STATE_READY} and {@link #STATE_ERROR}.
 * @returns {int} The state
 */
SceneJS.Instance.prototype.getState = function() {
    return this._state;
};

// @private
SceneJS.Instance.prototype._init = function(params) {
    if (params.uri) {
        this._uri = params.uri;
        this._state = SceneJS.Instance.STATE_READY;
        this._mustExist = params.mustExist;
    }
};

// @private
SceneJS.Instance.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    if (this._uri) {
        this._instanceSymbol(this._uri, traversalContext, data);
    } else {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException(
                        "SceneJS.instance uri property not defined"));
    }
};

// @private
SceneJS.Instance.prototype._changeState = function(newState, exception) {
    var oldState = this._state;
    this._state = newState;
    if (this._listeners["state-changed"]) { // Optimisation
        this._fireEvent("state-changed", { oldState: oldState, newState: newState, exception : exception });
    }
};

/* Returns a traversal context for traversal of the children of the given target node.
 *
 * If this Instance has children then it will have a callback that will render them after the last of
 * the target's sub-nodes have rendered, as effectively the children of that last node. The callback will
 * create a traversal context for the sub-nodes that will:
 *
 * - initially flag the traversal as inside the right fringe if the there are more than one child
 * - pass on any callback that was passed in on the traversal context to this Instance
 * - pass on any WithConfigs configs that were passed in on the traversal context to this Instance
 */
SceneJS.Instance.prototype._createTargetTraversalContext = function(traversalContext, target) {
    var callback;
    this._superCallback = traversalContext.callback;
    var _this = this;
    if (!this._callback) {
        this._callback = function(traversalContext, data) {
            var subTraversalContext = {
                callback : _this._superCallback,
                insideRightFringe : _this._children.length > 1,
                configs: traversalContext.configs,
                configsModes: traversalContext.configsModes
            };
            _this._renderNodes(subTraversalContext, data);
        };
    }
    return {
        callback: this._callback,
        insideRightFringe:  target._children.length > 1,
        configs: traversalContext.configs,
        configsModes: traversalContext.configsModes
    };
};

/**
 * Recursively renders the subtrees (child nodes) of the Instance in left-to-right, depth-first order. As the recursion
 * descends, the traversalContext tracks whether the current node is inside the right fringe of the right-most subtree.
 * As soon as the current node is at the right fringe and has no children, then it is the last node to render among all
 * the sub-nodes (the "terminal node"). If a callback is then present on the traversalContext, then that means that this
 * Instance is actually within a subtree of a Symbol node that is being instanced by another super-Instance. The
 * callback is then invoked, which causes the traversal of the super-Instance's subtree as if it were a child of the
 * terminal node.
 *
 * @param traversalContext
 * @param data
 */
SceneJS.Instance.prototype._renderNodes = function(traversalContext, data) {
    var numChildren = this._children.length;
    var child;
    var childConfigs;
    var configUnsetters;

    if (numChildren == 0) {

        /* Instance has no child nodes - render super-Instance's child nodes
         * through callback if one is passed in
         */
        if (traversalContext.callback) {
            traversalContext.callback(traversalContext, data);
        }

    } else {

        /* Instance has child nodes - last node in Instance's subtree will invoke
         * the callback, if any (from within its SceneJS.Node#_renderNodes)
         */
        for (var i = 0; i < numChildren; i++) {
            child = this._children[i];

            childConfigs = traversalContext.configs;
            configUnsetters = null;

            if (childConfigs && child._sid) {
                childConfigs = traversalContext.configs["#" + child._sid];
                if (childConfigs) {
                    configUnsetters = this._setConfigs(childConfigs, child);
                }
            }

            var childTraversalContext = {
                insideRightFringe : (i < numChildren - 1),
                callback : traversalContext.callback,
                configs : childConfigs || traversalContext.configs,
                configsModes : traversalContext.configsModes
            };

            child._render.call(child, childTraversalContext, data);

            if (configUnsetters) {
                this._unsetConfigs(configUnsetters);
            }
        }
    }
};

/** Instances a Symbol that is currently defined after being rendered prior to this Instance
 *
 * @private
 * @param symbolSIDPath Path to Symbol, relative to this Instance
 * @param traversalContext
 * @param data
 */
SceneJS.Instance.prototype._instanceSymbol = function(symbolSIDPath, traversalContext, data) {
    this._symbol = SceneJS._instancingModule.acquireInstance(symbolSIDPath);
    if (!this._symbol) {
        //SceneJS._loggingModule.info("SceneJS.Instance could not find SceneJS.Symbol to instance: '" + symbolSIDPath + "'");
        if (this._mustExist) {
            SceneJS._instancingModule.releaseInstance();
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.SymbolNotFoundException
                            ("SceneJS.Instance could not find SceneJS.Symbol to instance: '" + symbolSIDPath + "'"));
        }
        this._changeState(SceneJS.Instance.STATE_ERROR);
    } else {
        this._changeState(SceneJS.Instance.STATE_RENDERING);
        this._symbol._renderNodes(this._createTargetTraversalContext(traversalContext, this._symbol), data);
        SceneJS._instancingModule.releaseInstance();
        this._changeState(SceneJS.Instance.STATE_READY);
        this._symbol = null;
    }
};


/**
 *
 */
SceneJS.Instance.prototype.getTarget = function() {
    if (this.state != SceneJS.Instance.STATE_RENDERING) {
        return null;
    }
    return this._symbol;
};

/**
 *
 */
SceneJS.Instance.prototype.getURI = function() {
    return this._uri;
};

/** Factory function that returns a new {@link SceneJS.Instance} instance
 *  @param {Object} [cfg] Static configuration object
 * @param {String} cfg.uri URI of file to load
 * @param {int} [cfg.timeoutSecs] Timeout - falls back on any loadTimoutSecs that was configured on the {@link SceneJS.Scene}
 * at the root of the scene graph, or the default 180 seconds if none configured there
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Instance}
 */
SceneJS.instance = function() {
    var n = new SceneJS.Instance();
    SceneJS.Instance.prototype.constructor.apply(n, arguments);
    return n;
};
