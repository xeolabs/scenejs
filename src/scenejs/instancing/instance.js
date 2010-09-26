/**
 * @class Instantiates a target {@link SceneJS.Node} at the node's location within the scene graph.
 *
 * The flexible <a href="http://scenejs.wikispaces.com/instancing+algorithm">Instancing Algorithm</a> also permits recursive
 * instantiation, where target {@link SceneJS.Node}s may contain further instances of other target {@link SceneJS.Node}s,
 * and so on. Instances may also be parameterised using the data flow capabilities provided by the
 * {@link SceneJS.WithConfigs} nodes.</p>
 *
 * <p><b>Example 1.</b></p><p>Instantiation of a target node is a simple as refering to it by ID from an
 * {@link SceneJS.Instance}, as shown below. The target node may be anywhere in the scene graph. <p>
 * <pre><code>
 * new SceneJS.Cube({ id: "myBox" }),
 * new SceneJS.Instance( { target: "myBox" })
 * </code></pre>
 *
 * <p><b>Example 2.</b></p><p>Often you'll want to define target nodes within {@link SceneJS.Library} nodes in order
 * to ensure that they are only rendered when instantiated, since {@link SceneJS.Library} nodes cause scene traversal
 * to bypass their subtrees.<p>
 * <pre><code>
 *
 * // The Cube can now only be rendered when instantiated by a SceneJS.Instance
 *
 * new SceneJS.Library(
 *      new SceneJS.Cube({ id: "myBox" })),
 * new SceneJS.Instance( { target: "myBox" })
 * </code></pre>

 *
 * <h2>States and Events</h2>
 * <p>A SceneJS.Instance has four states which it transitions through during it's lifecycle, as described below. After
 * it transitions into each state, it will fire an event - see {@link SceneJS.Node}. Also, while in {@link #STATE_RENDERING},
 * it can provide its target {@link SceneJS.Node} node via {@link #getTargetNode}.<p>
 *
 * @events
 * @extends SceneJS.Node
 * @constructor
 * Creates a new SceneJS.Instance
 *  @param {Object} [cfg] Static configuration object
 * @param {String} cfg.target URI of file to load
 * @param {int} [cfg.timeoutSecs] Timeout - falls back on any loadTimoutSecs that was configured on the {@link SceneJS.Scene}
 * at the root of the scene graph, or the default 180 seconds if none configured there
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Instance = SceneJS.createNodeType("instance");

// @private
SceneJS.Instance.prototype._init = function(params) {
    this._symbol = null;
    this._target = params.target;
    this._mustExist = params.mustExist;

    if (this._target) {
        this._state = this._target
                ? SceneJS.Instance.STATE_READY     // Ready to hunt for target
                : SceneJS.Instance.STATE_INITIAL;  // Will chill out until we get a target
    }
};

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
 * this state, you can obtain the target {@link SceneJS.Symbol} through {@link #getTargetNode}. From this
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

/**
 * While in {@link #STATE_RENDERING}, returns the target {@link SceneJS.Symbol} currently being rendered.
 * @returns {SceneJS.Symbol} Target symbol
 */
SceneJS.Instance.prototype.getTargetNode = function() {
    if (this._state != SceneJS.Instance.STATE_RENDERING) {
        return null;
    }
    return this._symbol;
};

/**
 * Returns the URI on which the Instance looks for its target {@link SceneJS.Node}
 */
SceneJS.Instance.prototype.getTarget = function() {
    return this._target;
};

/**
 Returns the URI on which the Instance looks for its target {@link SceneJS.Node}
 @param {String} target - target node ID
 @returns {SceneJS.Instance} This node
 */
SceneJS.Instance.prototype.setTarget = function(target) {
    this._target = target;
    this._setDirty();
    return this;
};

// @private
SceneJS.Instance.prototype._render = function(traversalContext) {
    if (this._target) {
        var nodeId = this._target; // Make safe to set #uri while instantiating

        this._symbol = SceneJS._instancingModule.acquireInstance(nodeId);

        if (!this._symbol) {
            var exception;
            if (this._mustExist) {
                throw SceneJS._errorModule.fatalError(
                        exception = new SceneJS.errors.SymbolNotFoundException
                                ("SceneJS.Instance could not find target node: '" + this._target + "'"));
            }
            this._changeState(SceneJS.Instance.STATE_ERROR, exception);

        } else {
            this._changeState(SceneJS.Instance.STATE_RENDERING);
            this._symbol._renderWithEvents(this._createTargetTraversalContext(traversalContext, this._symbol));
            SceneJS._instancingModule.releaseInstance(nodeId);
            this._changeState(SceneJS.Instance.STATE_READY);
            this._symbol = null;
        }
    }
};

// @private
SceneJS.Instance.prototype._changeState = function(newState, exception) {
    var oldState = this._state;
    this._state = newState;
    if (this._numListeners > 0 && this._listeners["state-changed"]) { // Optimisation
        this._fireEvent("state-changed", {
            oldState: oldState,
            newState: newState,
            exception : exception
        });
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
        this._callback = function(traversalContext) {
            var subTraversalContext = {
                callback : _this._superCallback,
                insideRightFringe : _this._children.length > 1
            };
            _this._renderNodes(subTraversalContext);
        };
    }
    return {
        callback: this._callback,
        insideRightFringe:  target._children.length > 1
    };
};