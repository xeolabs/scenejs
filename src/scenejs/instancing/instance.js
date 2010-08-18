/**
 * @class Instantiates the subtree of a target {@link SceneJS.Symbol} at the node's location within the scene graph.
 *
 * The flexible <a href="http://scenejs.wikispaces.com/instancing+algorithm">Instancing Algorithm</a> also permits recursive
 * instantiation, where target {@link SceneJS.Symbol}s may define further instances of other target {@link SceneJS.Symbol}s,
 * and so on. Instances may also be parameterised using the data flow capabilities provided by the
 * {@link SceneJS.WithData} and {@link SceneJS.WithConfigs} nodes.</p>
 *
 * <p>When a {@link SceneJS.Symbol} has been rendered prior to the Instance during the current scene traversal, then the
 * Instance can instantiate it with a URI that which will walk the SIDs (sub-identifiers) of previously rendered
 * nodes to resolve the {@link SceneJS.Symbol}. Here's the most trivial case - see how the fragment URI of the instance
 * maps to the {@link SceneJS.Symbol}'s SID.<p>
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
 * <h2>States and Events</h2>
 * <p>A SceneJS.Instance has four states which it transitions through during it's lifecycle, as described below. After
 * it transitions into each state, it will fire an event - see {@link SceneJS.Node}. Also, while in {@link #STATE_RENDERING},
 * it can provide its target {@link SceneJS.Symbol} node via {@link #getTarget}.<p>
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
 * Initial state of a SceneJS.Instance, in which it has not been rendered yet and thus not attempted to resolve its
 * target {@link SceneJS.Symbol} yet.
 * @const
 */
SceneJS.Instance.STATE_INITIAL = 0;

/**
 * State of a SceneJS.Instance in which instantiation has failed. This condition might be temporary (eg. the target
 * {@link SceneJS.Symbol} has just not been rendered yet for some reason), so a SceneJS.Instance will then try
 * instancing again when next rendered, transitioning to {@link STATE_RENDERING} when that succeeds.
 * @const
 */
SceneJS.Instance.STATE_ERROR = -1;

/**
 * State of a SceneJS.Instance in which it will attempt to instantiate its target when next rendered. This is when it
 * is ready to attempt aquisition of its target {@link SceneJS.Symbol}. From here, it will transition to
 * {@link #STATE_RENDERING} if that succeeds, otherwise it will transition to {@link #STATE_ERROR}.
 * @const
 */
SceneJS.Instance.STATE_READY = 2;


/**
 * State of an SceneJS.Instance in which it is currently rendering its target {@link SceneJS.Symbol}. While in
 * this state, you can obtain the target {@link SceneJS.Symbol} through {@link #getTarget}. From this
 * state, the SceneJS.Instance will transition back to {@link #STATE_READY} once it has completed rendering the target.
 * @const
 */
SceneJS.Instance.STATE_RENDERING = 3;

/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL},
 * {@link #STATE_READY}, {@link #STATE_ERROR} and {@link #STATE_RENDERING}.
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
                new SceneJS.errors.InvalidNodeConfigException(
                        "SceneJS.Instance uri property not defined"));
    }
};

// @private
SceneJS.Instance.prototype._changeState = function(newState, exception) {
    var oldState = this._state;
    this._state = newState;
    if (this._listeners["state-changed"]) { // Optimisation
        this.fireEvent("state-changed", { oldState: oldState, newState: newState, exception : exception });
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
 *
 * @private
 */
SceneJS.Instance.prototype._createTargetTraversalContext = function(traversalContext, target) {
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
 * @private
 */
//SceneJS.Instance.prototype._renderNodes = function(traversalContext, data) {    
//    var numChildren = this._children.length;
//    var child;
//    var childConfigs;
//    var configUnsetters;
//
//    if (numChildren == 0) {
//
//        /* Instance has no child nodes - render super-Instance's child nodes
//         * through callback if one is passed in
//         */
//        if (traversalContext.callback) {
//            traversalContext.callback(traversalContext, data);
//        }
//
//    } else {
//
//        /* Instance has child nodes - last node in Instance's subtree will invoke
//         * the callback, if any (from within its SceneJS.Node#_renderNodes)
//         */
//        var childTraversalContext;
//        for (var i = 0; i < numChildren; i++) {
//            child = this._children[i];
//            configUnsetters = null;
//            childConfigs = traversalContext.configs;
//            if (childConfigs && child._sid) {
//                childConfigs = childConfigs[child._sid];
//                if (childConfigs) {
//                    configUnsetters = this._setConfigs(childConfigs, child);
//                }
//            }
//            childTraversalContext = {
//                insideRightFringe : (i < numChildren - 1),
//                callback : traversalContext.callback,
//                configs : childConfigs || traversalContext.configs,
//                configsModes : traversalContext.configsModes
//            };
//            child._renderWithEvents.call(child, childTraversalContext, data);
//            if (configUnsetters) {
//                this._unsetConfigs(configUnsetters);
//            }
//        }
//    }
//};

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
                    new SceneJS.errors.SymbolNotFoundException
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
 * While in {@link #STATE_RENDERING}, returns the target {@link SceneJS.Symbol} currently being rendered.
 * @returns {SceneJS.Symbol} Target symbol
 */
SceneJS.Instance.prototype.getTarget = function() {
    if (this.state != SceneJS.Instance.STATE_RENDERING) {
        return null;
    }
    return this._symbol;
};

/**
 * Returns the URI on which the Instance looks for its target {@link SceneJS.Symbol}
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

SceneJS.registerNodeType("instance", SceneJS.instance);

