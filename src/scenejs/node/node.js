/**
 * A simple recursive descent parser to parse SceneJS's flexible node
 * arguments.
 *
 * @private
 */
SceneJS._NodeArgParser = new (function() {

    this.parseArgs = function(args, node) {
        node._getParams = function() {
            return {};
        };
        node._fixedParams = true;
        node._config = {};
        if (args.length > 0) {
            var arg = args[0];
            if (arg instanceof Function) {
                this._parseConfigFunc(arg, args, 1, node);
            } else if (arg._render) {
                this._parseChild(arg, args, 1, node);
            } else {
                this._parseConfigObject(arg, args, 1, node);
            }
        }
    };

    this._parseConfigObject = function(arg, args, i, node) {
        node._config = arg;
        node._getParams = (function() {
            var _config = node._config;
            return function() {
                return _config;
            };
        })();
        if (i < args.length) {
            arg = args[i];
            if (arg instanceof Function) {
                this._parseConfigFunc(arg, args, i + 1, node);
            } else if (arg._render) {
                this._parseChild(arg, args, i + 1, node);
            } else {
                SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException
                        ("Unexpected type for node argument " + i + " - expected a config function or a child node"));
            }
        }
    };

    this._parseConfigFunc = function(arg, args, i, node) {
        node._getParams = (function() {
            var _config = node._config;
            var _arg = arg;
            return function(data) {
                var c = _arg.call(this, data);
                for (var key in c) {
                    if (c.hasOwnProperty(key)) {
                        _config[key] = c[key];
                    }
                }
                return _config;
            };
        })();
        node._fixedParams = false;
        if (i < args.length) {
            arg = args[i];
            if (arg._nodeType) {
                this._parseChild(arg, args, i + 1, node);
            } else {
                SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException
                        ("Unexpected type for node argument " + i + " - expected a child node"));
            }
        }
    };

    this._parseChild = function(arg, args, i, node) {
        node._children.push(arg);
        arg._parent = node;
        arg._memoLevel = 0;
        if (i < args.length) {
            arg = args[i];
            if (arg._nodeType) {
                this._parseChild(arg, args, i + 1, node);
            } else {
                SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException
                        ("Unexpected type for node argument " + i + " - expected a child node"));
            }
        }
    };
})();


/**
 * @class The basic scene node type, providing the ability to connect nodes into parent-child relationships to form scene graphs.
 *
 * <h1>Node Type ID</h1>
 * <p>Every node type has a SceneJS type ID, which may be got with {@link #getType}. This is the list of all valid xtypes:</p>
 *
 * <table>
 * <tr><td>type</td><td>Class</td></tr>
 * <tr><td>----</td><td>-----</td></tr>
 * <tr><td>bounding-box</td><td>{@link SceneJS.BoundingBox}</td></tr>
 * <tr><td>cube</td><td>{@link SceneJS.objects.Cube}</td></tr>
 * <tr><td>fog</td><td>{@link SceneJS.Fog}</td></tr>
 * <tr><td>generator</td><td>{@link SceneJS.Generator}</td></tr>
 * <tr><td>geometry</td><td>{@link SceneJS.Geometry}</td></tr>
 * <tr><td>instance</td><td>{@link SceneJS.Instance}</td></tr>
 * <tr><td>lights</td><td>{@link SceneJS.Lights}</td></tr>
 * <tr><td>load</td><td>{@link SceneJS.Load}</td></tr>
 * <tr><td>load-collada</td><td>{@link SceneJS.LoadCollada}</td></tr>
 * <tr><td>locality</td><td>{@link SceneJS.Locality}</td></tr>
 * <tr><td>logging</td><td>{@link SceneJS.Logging}</td></tr>
 * <tr><td>logging-to-page</td><td>{@link SceneJS.LoggingToPage}</td></tr>
 * <tr><td>lookat</td><td>{@link SceneJS.LookAt}</td></tr>
 * <tr><td>material</td><td>{@link SceneJS.Material}</td></tr>
 * <tr><td>model-matrix</td><td>{@link SceneJS.ModelMatrix}</td></tr>
 * <tr><td>name</td><td>{@link SceneJS.Name}</td></tr>
 * <tr><td>node</td><td>{@link SceneJS.Node}</td></tr>
 * <tr><td>perspective</td><td>{@link SceneJS.Perspective}</td></tr>
 * <tr><td>renderer</td><td>{@link SceneJS.Renderer}</td></tr>
 * <tr><td>rotate</td><td>{@link SceneJS.Rotate}</td></tr>
 * <tr><td>scale</td><td>{@link SceneJS.Scale}</td></tr>
 * <tr><td>scene</td><td>{@link SceneJS.Scene}</td></tr>
 * <tr><td>scalar-interpolator</td><td>{@link SceneJS.ScalarInterpolator}</td></tr>
 * <tr><td>selector</td><td>{@link SceneJS.Selector}</td></tr>
 * <tr><td>sphere</td><td>{@link SceneJS.objects.Sphere}</td></tr>
 * <tr><td>stationary</td><td>{@link SceneJS.Stationary}</td></tr>
 * <tr><td>symbol</td><td>{@link SceneJS.Symbol}</td></tr>
 * <tr><td>teapot</td><td>{@link SceneJS.objects.Teapot}</td></tr>
 * <tr><td>text</td><td>{@link SceneJS.Text}</td></tr>
 * <tr><td>texture</td><td>{@link SceneJS.Texture}</td></tr>
 * <tr><td>translate</td><td>{@link SceneJS.Translate}</td></tr>
 * <tr><td>view-matrix</td><td>{@link SceneJS.ViewMatrix}</td></tr>
 * <tr><td>with-data</td><td>{@link SceneJS.WithData}</td></tr>
 * </table>
 *
 * <h2>Dynamic Configuration</h2>
 * <p>The constructors of SceneJS node types may optionally take a callback function instead of an config object,
 * to generate the node's configuration dynamically each time it is rendered.</p>
 * <p>The example below shows scene graph that contains a dynamically-configured {@link SceneJS.Perspective} node that takes
 * its field-of-view parameter through such a callback. Note how the parameter is injected into the scene when rendered.</p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({ canvasId: 'theCanvas' },
 *
 *       new SceneJS.Perspective(
 *                      function(data) {
 *                            return {
 *                                fovy : data.get("fovy"),
 *                                aspect : 1.0,
 *                                near : 0.10,
 *                                far : 5000.0 };
 *                      },
 *                      // ... chld nodes ...
 *                  );
 *
 * exampleScene.render({ fovy: 45.0 });
 * </code></pre>
 * <p>See the {@link SceneJS.WithData} node for more information on data flow.</p>
 * <p>Note that {@link SceneJS.Node} does not actually have any use for dynamic configuration.</p>
 *
 * <h2>Events</h2>
 * <p>You can register listeners to handle events fired by each node type.</p>
 * <p>This example binds a listener for "state-changed" events on a {@link SceneJS.Load} node:</p>
 * <pre><code>
 * var myLoad = new SceneJS.Load({ uri: "http://foo.com/..." });
 *
 * var handler = function(node, params) {
 *                  alert("Node " + node.getType() + " has changed state to " + node.getState());
 *              };
 *
 * myLoad.addListener("state-changed", handler,
 *
 *              // Listener options
 *              {
 *                    scope: this   // Optional scope for handler call, defaults to this
 *              });
 *
 * myLoad.removeListener("state-changed", handler);
 * </code></pre>
 * <p>Listeners are only added through {@link #addListener} and not through the node's constructor. This way, if the
 * constructor takes a dynamic config function (as described above) then the function does not have to redefine the
 * listeners, which will not be affected by the function.</p>
 *
 * @constructor
 * Create a new SceneJS.node
 * @param {SceneJS.node, ...} arguments Zero or more child nodes
 */
SceneJS.Node = function() {
    this._nodeType = "node";
    this._children = [];
    this._fixedParams = true;
    this._parent = null;
    this._listeners = {};

    /* Used by many node types to track the level at which they can
     * memoise internal state. When rendered, a node increments
     * this each time it discovers that it can cache more state, so that
     * it knows not to recompute that state when next rendered.
     * Since internal state is usually dependent on the states of higher
     * nodes, this is reset whenever the node is attached to a new
     * parent.
     *
     * private
     */
    this._memoLevel = 0;
    SceneJS._NodeArgParser.parseArgs(arguments, this);
};

SceneJS.Node.prototype.constructor = SceneJS.Node;

/**
 * Resets memoization level to zero - used when moving nodes around in graph
 * @private
 */
SceneJS.Node.prototype._resetMemoLevel = function() {
    this._memoLevel = 0;
    for (var i = 0; i < this._children.length; i++) {
        this._children[i]._resetMemoLevel();
    }
};

/** @private */
SceneJS.Node.prototype._renderNodes = function(traversalContext, data, children) {
    var child;
    children = children || this._children;
    var len = children.length;
    if (len) {
        for (var i = 0; i < len; i++) {
            child = children[i];
            child._render.call(child, { // Traversal context
                appendix : traversalContext.appendix,
                insideRightFringe: traversalContext.insideRightFringe || (i < len - 1)
            }, data);
        }
    } else {

        /* Leaf node - if on right fringe of tree then
         * render appended nodes
         */
        if (traversalContext.appendix && (!traversalContext.insideRightFringe)) {
            len = traversalContext.appendix.length;
            for (var i = 0; i < len; i++) {
                child = traversalContext.appendix[i];
                child._render.call(child, { // Traversal context
                    appendix : null,
                    insideRightFringe: (i < len - 1)
                }, data);
            }
        }
    }
};

/** @private */
SceneJS.Node.prototype._renderNode = function(index, traversalContext, data) {
    var child = this._children[index];
    child._render.call(child, traversalContext, data);
};

/** @private */
SceneJS.Node.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    this._renderNodes(traversalContext, data);
};

/**
 * Returns the type ID of the node. For the SceneJS.Node base class, it is "node",
 * which is overriden in sub-classes.
 * @returns {string} Type ID
 */
SceneJS.Node.prototype.getType = function() {
    return this._nodeType;
};

/**
 * Returns the number of child nodes
 * @returns {int} Number of child nodes
 */
SceneJS.Node.prototype.getNumNodes = function() {
    return this._children.length;
};

/** Returns child nodes
 * @returns {Array} Child nodes
 */
SceneJS.Node.prototype.getNodes = function() {
    var list = new Array(this._children.length);
    var len = this._children.length;
    for (var i = 0; i < len; i++) {
        list[i] = this._children[i];
    }
    return list;
};

/** Returns child node at given index
 * @returns {SceneJS.Node} Child node
 */
SceneJS.Node.prototype.getNodeAt = function(index) {
    return this._children[index];
};

/** Removes the child node at the given index
 * @param {int} index Child node index
 */
SceneJS.Node.prototype.removeNodeAt = function(index) {
    var r = this._children.splice(index, 1);
    if (r.length > 0) {
        r[0]._parent = null;
        return r[0];
    } else {
        return null;
    }
};

/** Appends a child node
 * @param {SceneJS.Node} node Child node
 * @return {SceneJS.Node} The child node
 */
SceneJS.Node.prototype.addNode = function(node) {
    if (node._parent != null) {
        SceneJS_errorModule.fatalError(
                new SceneJS.InvalidSceneGraphException(
                        "Attempted to add a child to a node without " +
                        "first removing the child from it's current parent"));
    }
    this._children.push(node);
    node._parent = this;
    node._resetMemoLevel();
    return node;
};

/** Inserts a child node
 * @param {SceneJS.Node} node Child node
 * @param {int} i Index for new child node
 * @return {SceneJS.Node} The child node
 */
SceneJS.Node.prototype.insertNode = function(node, i) {
    if (node._parent != null) {
        SceneJS_errorModule.fatalError(
                new SceneJS.InvalidSceneGraphException(
                        "Attempted to insert a child to a node without " +
                        "first removing the child from it's current parent"));
    }
    if (i == undefined || i <= 0) {
        this._children.unshift(node);
    } else if (i >= this._children.length) {
        this._children.push(node);
    } else {
        this._children.splice(i, 0, node);
    }
    node._parent = this;
    node._resetMemoLevel();
    return node;
};

/**
 * Registers a listener for a given event on this node. If the event type
 * is not supported by this node type, then the listener will never be called.
 * <p><b>Example:</b>
 * <pre><code>
 * var node = new SceneJS.Node();
 *
 * node.addListener(
 *
 *              // eventName
 *              "some-event",
 *
 *              // handler
 *              function(node,      // Node we are listening to
 *                       params) {  // Whatever params accompany the event type
 *
 *                     // ...
 *              },
 *
 *              // options
 *              {
 *                     // Optional scope on which handler is
 *                     // called - default is this
 *                     scope: this
 *              }
 * );
 *
 *
 * </code></pre>
 *
 * @param {String} eventName One of the event types supported by this node
 * @param handler - Handler function that be called as specified
 * @param options - Optional options for the handler as specified
 * @return {SceneJS.Node} this
 */
SceneJS.Node.prototype.addListener = function(eventName, handler, options) {
    var list = this._listeners[eventName];
    if (!list) {
        list = [];
        this._listeners[eventName] = list;
    }
    list.push({
        eventName : eventName,
        handler: handler,
        options : options || {}
    });
    return this;
};

/**
 * @private
 */
SceneJS.Node.prototype._fireEvent = function(eventName, params) {
    var list = this._listeners[eventName];
    if (list) {
        if (!params) {
            params = {};
        }
        for (var i = 0; i < list.length; i++) {
            var listener = list[i];
            listener.handler.call(listener.options.scope || this, this, params);
        }
    }
};

/**
 * Removes a handler that is registered for the given event on this node.
 * Does nothing if no such handler registered.
 *
 * @param {String} eventName Event type that handler is registered for
 * @param handler - Handler function that is registered for the event
 * @return {function} The handler, or null if not registered
 */
SceneJS.Node.prototype.removeListener = function(eventName, handler) {
    var list = this._listeners[eventName];
    if (!list) {
        return null;
    }
    for (var i = 0; i < list.length; i++) {
        if (list[i].handler == handler) {
            list.splice(i, 1);
            return handler;
        }
    }
    return null;
};

/** Returns the parent node
 * @return {SceneJS.Node} The parent node
 */
SceneJS.Node.prototype.getParent = function() {
    return this._parent;
};

/** Returns either all child or all sub-nodes of the given type, depending on whether search is recursive or not.
 * @param {string} type Node type
 * @param {boolean} recursive When true, will return all matching nodes in subgraph, otherwise returns just children (default)
 * @return {SceneJS.node[]} Array of matching nodes
 */
SceneJS.Node.prototype.findNodesByType = function(type, recursive) {
    return this._findNodesByType(type, [], recursive);
};

/** @private */
SceneJS.Node.prototype._findNodesByType = function(type, list, recursive) {
    for (var i = 0; i < this._children; i++) {
        var node = this._children[i];
        if (node.nodeType == type) {
            list.add(node);
        }
    }
    if (recursive) {
        for (var i = 0; i < this._children; i++) {
            this._children[i]._findNodesByType(type, list, recursive);
        }
    }
    return list;
};

/** Returns a new SceneJS.Node instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Node constructor
 * @returns {SceneJS.Node}
 */
SceneJS.node = function() {
    var n = new SceneJS.Node();
    SceneJS.Node.prototype.constructor.apply(n, arguments);
    return n;
};


