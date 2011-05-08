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
 * new SceneJS.Instance( {
 *      target: "myBox",
 *      retry: false         // Stop trying to instance if target not found - default is true to keep trying
 * })
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
 * it transitions into each state, it will fire an event - see {@link SceneJS.Node}. Also, while in {@link #STATE_CONNECTED},
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
    this.setTarget(params.target);
    this._attr.mustExist = params.mustExist;
    this._attr.retry = (params.retry == null || params.retry == undefined) ? false : params.retry;
    this._symbol = null;

    if (this._attr.target) {
        this._state = this._attr.target
                ? SceneJS.Instance.STATE_SEARCHING     // Ready to hunt for target
                : SceneJS.Instance.STATE_INITIAL;  // Will chill out until we get a target
    }
};

/**
 * Initial state of a SceneJS.Instance, in which it has not been rendered yet and thus not attempted to resolve its
 * target node yet.
 * @const
 */
SceneJS.Instance.STATE_INITIAL = "init";

/**
 * State of a SceneJS.Instance in which instantiation has failed. This condition might be temporary (eg. the target
 * node has just not been rendered yet for some reason), so a SceneJS.Instance will then try
 * instancing again when next rendered, transitioning to {@link STATE_CONNECTED} when that succeeds.
 * @const
 */
SceneJS.Instance.STATE_ERROR = "error";

/**
 * State of a SceneJS.Instance in which it will attempt to instantiate its target when next rendered. This is when it
 * is ready to attempt aquisition of its target {@link SceneJS.Symbol}. From here, it will transition to
 * {@link #STATE_CONNECTED} if that succeeds, otherwise it will transition to {@link #STATE_ERROR}.
 * @const
 */
SceneJS.Instance.STATE_SEARCHING = "searching";


/**
 * State of an SceneJS.Instance in which it is currently rendering its target {@link SceneJS.Symbol}. While in
 * this state, you can obtain the target {@link SceneJS.Symbol} through {@link #getTargetNode}. From this
 * state, the SceneJS.Instance will transition back to {@link #STATE_SEARCHING} once it has completed rendering the target.
 * @const
 */
SceneJS.Instance.STATE_CONNECTED = "connected";

/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL},
 * {@link #STATE_SEARCHING}, {@link #STATE_ERROR} and {@link #STATE_CONNECTED}.
 * @returns {int} The state
 */
SceneJS.Instance.prototype.getState = function() {
    return this._state;
};

/**
 * Returns the URI on which the Instance looks for its target {@link SceneJS.Node}
 */
SceneJS.Instance.prototype.getTarget = function() {
    return this._attr.target;
};

/**
 Returns the URI on which the Instance looks for its target {@link SceneJS.Node}
 @param {String} target - target node ID
 @returns {SceneJS.Instance} This node
 */
SceneJS.Instance.prototype.setTarget = function(target) {

    /* Deregister old link
     */
    var map;
    if (this._attr.target) {
        map = SceneJS._nodeInstanceMap[this._attr.target];
        if (!map) {
            map = SceneJS._nodeInstanceMap[this._attr.target] = {
                numInstances: 0,
                instances: {}
            };
        }
        map.numInstances--;
        map.instances[this._attr.id] = undefined;
    }
    this._attr.target = target;

    /* Register new link
     */
    if (target) {
        map = SceneJS._nodeInstanceMap[target];
        if (!map) {
            map = SceneJS._nodeInstanceMap[this._attr.target] = {
                numInstances: 0,
                instances: {}
            };
        }
        map.numInstances++;
        map.instances[this._attr.id] = this._attr.id;

    }
    this._setDirty();
    return this;
};



// @private
SceneJS.Instance.prototype._compile = function(traversalContext) {
    if (this._attr.target) {
        var nodeId = this._attr.target; // Make safe to set #uri while instantiating

        this._symbol = SceneJS._instancingModule.acquireInstance(this._attr.id, nodeId);

        if (!this._symbol) {

            /* Couldn't find target
             */
            var exception;
            if (this._attr.mustExist) {
                throw SceneJS._errorModule.fatalError(
                        exception = SceneJS.errors.INSTANCE_TARGET_NOT_FOUND,
                                "SceneJS.Instance could not find target node: '" + this._attr.target + "'");
            }
            this._changeState(SceneJS.Instance.STATE_ERROR, exception);

            /**
             * If we're going to keep trying to find the
             * target, then we'll need the scene graph to
             * keep rendering so that this instance can
             * keep trying. Otherwise, we'll wait for the next
             * render.
             */
            if (this._attr.retry) {

                SceneJS._compileModule.nodeUpdated(this, "searching");

                /* Record this node as still loading, for "loading-status"
                 * events to include in their reported stats
                 */
                SceneJS._loadStatusModule.status.numNodesLoading++;
            }

        } else {

            /* Record this node as loaded
             */
            SceneJS._loadStatusModule.status.numNodesLoaded++;

            this._changeState(SceneJS.Instance.STATE_CONNECTED);

            if (SceneJS._compileModule.preVisitNode(this._symbol)) {
                SceneJS._flagsModule.preVisitNode(this._symbol);

                this._symbol._compileWithEvents(this._createTargetTraversalContext(traversalContext, this._symbol));

                SceneJS._flagsModule.postVisitNode(this._symbol);
            }
            SceneJS._compileModule.postVisitNode(this._symbol);
            
            SceneJS._renderModule.marshallStates();

            SceneJS._instancingModule.releaseInstance(nodeId);
            this._changeState(SceneJS.Instance.STATE_SEARCHING);
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
    var self = this;
    if (!this._callback) {
        this._callback = function(traversalContext) {
            var subTraversalContext = {

                /* For instancing mechanism, track if we are traversing down right fringe
                 * and pass down the callback.
                 * 
                 * DOCS: http://scenejs.wikispaces.com/Instancing+Algorithm
                 */
                insideRightFringe : self._children.length > 1,
                callback : self._superCallback
            };
            self._compileNodes(subTraversalContext);
        };
    }
    return {       
        callback: this._callback,
        insideRightFringe:  target._children.length > 1
    };
};

/** @private
 */
SceneJS.Instance.prototype._destroy = function() {
    if (this._attr.target) {
        var map = SceneJS._nodeInstanceMap[this._attr.target];
        if (map) {
            map.numInstances--;
            map.instances[this._attr.id] = undefined;
        }
    }
};


/*---------------------------------------------------------------------
 * Query methods - calls to these only legal while node is rendering
 *-------------------------------------------------------------------*/

/**
 * Queries the Instance's current render-time state.
 * This will update after each "state-changed" event.
 * @returns {String} The state
 */
SceneJS.Instance.prototype.queryState = function() {
    return this._state;
};

/**
 * Queries the instance's target node, returning the target only if acquired yet.
 * @returns {SceneJS.Symbol} Target symbol
 */
SceneJS.Instance.prototype.queryTargetNode = function() {
    if (this._state != SceneJS.Instance.STATE_CONNECTED) {
        return null;
    }
    return SceneJS.withNode(this._symbol);
};