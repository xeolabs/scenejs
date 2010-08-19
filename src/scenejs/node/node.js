/**
 * @class The basic scene node type, providing the ability to connect nodes into parent-child relationships to form scene graphs.
 *
 * <h1>Flexible Constructor Signature</h1>
 * <p>Node constructors have a flexible signature to support different forms of instantiation. They generally take
 * static and/or dynamic configuration arguments followed by zero or more child nodes.</p>
 *
 * <b>Simple static configuration</b>
 * <p>The simplest form is with a single static configuration object. For many nodes you only need to specify properties
 * where you want to override the node's defaults. Note the <b>sid</b> property, which is an optional subidentifier
 * which must be unique within the scope of the parent {@link SceneJS.Node}:</p>
 * <pre><code>
 * var n1 = new SceneJS.Scale({
 *                 sid:  "myScale",                // Optional subidentifier, unique within scope of parent node
 *                 info: "This is my Scale node",  // Optional metadata, useful for debugging
 *                 x:    100.0 },                  // Falls back on node's defaults of 1.0 for y and z
 *
 *                      new SceneJS.Geometry( ... )  // Child nodes, zero or more
 *             );
 * </code></pre>
 * Note the optional <b>info</b> property, which you can provide in order to attach a note that may be useful for
 * debugging, which may be got with {@link #getInfo}.
 * <h2>Dynamic configuration</h2>
 * <p>Dynamic configuration can be achieved through a callback that is invoked each time the node is rendered, which
 * will pull configs off the scene data scope (more explanation on that below):</p>
 * <pre><code>
 * var n2 = new SceneJS.Scale(
 *
 *                      function(data) {
 *                              return {
 *                                 x: data.get("scaleX"),    // Falls back on node's default of 1.0 when "scaleX" is null
 *                                 y: data.get("scaleY")
 *                              };
 *                      },
 *
 *                      new SceneJS.Geometry( ... )
 *             );
 * </code></pre>
 *
 * <h2>Static configuration with dynamic override</h2>
 * <p>A combination of static and dynamic configuration can be achieved through both a config object and a callback. The
 * config object's properties are set on the node immediately, then overridden by the callback at render-time:
 * <pre><code>
 * var n3 = new SceneJS.Scale(
 *
 *                      { x: 100.0 },                      // Falls back on node's defaults of 1.0 for y and z
 *
 *                      function(data) {
 *                              return {
 *                                 x: data.get("scaleX"),  // Falls back on 100.0 when "scaleX" is null
 *                                 y: data.get("scaleY")   // Falls back on node's default of 1.0 when "scaleY" is null
 *                              };
 *                      },
 *
 *                      new SceneJS.Geometry( ... ),     // A couple of child nodes this time, just for fun
 *                      new SceneJS.Geometry( ... )
 *             );
 * </pre></code>
 *
 * <h2>No configuration</h2>
 * <p>For many node types you can omit configuration altogether. This node falls back on defaults for all configs:</p>
 * <pre><code>
 * var n4 = new SceneJS.Scale(                           // Scales by defaults of 1.0 on X, Y and Z axis
 *
 *                  new SceneJS.Geometry( ... )        // Here's a child node
 *             );
 * </code></pre>
 *
 * <h2>A bit more on dynamic configuration</h2>
 * <p>The <b>data</b> parameter on the dynamic config callbacks shown above embodies a scene data scope. SceneJS
 * provides a fresh global data scope within each scene when it is rendered, into which you can inject data when you
 * render the scene graph. The example below demonstrates a property injected into the scope on render, which is then
 * pulled by a node's config callback when the node is rendered:
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({ canvasId: 'theCanvas' },
 *
 *       new SceneJS.LookAt(
 *                      function(data) {
 *                            return {
 *                                eye  : data.get("eye"),
 *                                look : { x: 0, y: 0, z: 0 },
 *                                up   : { x: 0, y: 1, z: 0 }
 *                            };
 *                      },
 *
 *                      // ... chld nodes ...
 *                  );
 *
 * exampleScene
 *     .setData({ eye: { x: 0, y: 0, z: -100 })
 *         .render()
 * </code></pre>
 * <p>Using {@link SceneJS.WithData} nodes, you can create chains of sub-data scopes, to feed data down into the scene
 * hierarchy.</p>
 *
 * <h1>Node Type ID</h1>
 * <p>Every node type, (ie. subtypes of {@link SceneJS.Node}, has a SceneJS type ID, which may be got with {@link #getType}.
 * This is the list of all valid xtypes:</p>
 *
 * <table>
 * <tr><td>type</td><td>Class</td></tr>
 * <tr><td>----</td><td>-----</td></tr>
 * <tr><td>bounding-box</td><td>{@link SceneJS.BoundingBox}</td></tr>
 * <tr><td>camera</td><td>{@link SceneJS.Camera}</td></tr>
 * <tr><td>cube</td><td>{@link SceneJS.objects.Cube}</td></tr>
 * <tr><td>fog</td><td>{@link SceneJS.Fog}</td></tr>
 * <tr><td>generator</td><td>{@link SceneJS.Generator}</td></tr>
 * <tr><td>geometry</td><td>{@link SceneJS.Geometry}</td></tr>
 * <tr><td>instance</td><td>{@link SceneJS.Instance}</td></tr>
 * <tr><td>lights</td><td>{@link SceneJS.Lights}</td></tr>
 * <tr><td>locality</td><td>{@link SceneJS.Locality}</td></tr>
 * <tr><td>lookat</td><td>{@link SceneJS.LookAt}</td></tr>
 * <tr><td>material</td><td>{@link SceneJS.Material}</td></tr>
 * <tr><td>matrix</td><td>{@link SceneJS.Matrix}</td></tr>
 * <tr><td>node</td><td>{@link SceneJS.Node}</td></tr>
 * <tr><td>perspective</td><td>{@link SceneJS.Perspective}</td></tr>
 * <tr><td>renderer</td><td>{@link SceneJS.Renderer}</td></tr>
 * <tr><td>rotate</td><td>{@link SceneJS.Rotate}</td></tr>
 * <tr><td>scale</td><td>{@link SceneJS.Scale}</td></tr>
 * <tr><td>scene</td><td>{@link SceneJS.Scene}</td></tr>
 * <tr><td>interpolator</td><td>{@link SceneJS.Interpolator}</td></tr>
 * <tr><td>selector</td><td>{@link SceneJS.Selector}</td></tr>
 * <tr><td>sphere</td><td>{@link SceneJS.objects.Sphere}</td></tr>
 * <tr><td>stationary</td><td>{@link SceneJS.Stationary}</td></tr>
 * <tr><td>symbol</td><td>{@link SceneJS.Symbol}</td></tr>
 * <tr><td>teapot</td><td>{@link SceneJS.objects.Teapot}</td></tr>
 * <tr><td>text</td><td>{@link SceneJS.Text}</td></tr>
 * <tr><td>texture</td><td>{@link SceneJS.Texture}</td></tr>
 * <tr><td>translate</td><td>{@link SceneJS.Translate}</td></tr>
 * <tr><td>with-data</td><td>{@link SceneJS.WithData}</td></tr>
 * <tr><td>with-configs</td><td>{@link SceneJS.WithConfigs}</td></tr>
 * <tr><td>socket</td><td>{@link SceneJS.Socket}</td></tr>
 * </table>
 *
 * <h2>Events</h2>
 * <p>You can register listeners to handle events fired by each node type. They can be registered either through the
 * constructor on a static config object, or at any time on a node instance through its {@link #addListener} method.</p>
 * <p><b>Registering listeners on configuration</b></p>
 * <p>The example below creates a {@link SceneJS.Instance} node, with a "state-changed" listener registered through its constructor.
 * To specify event-handling options, specify an object containing the handler function and your selected options. When no options
 * are required, just specify the function.
 * <pre><code>
 * var myLoad = new SceneJS.Instance({
 *
 *                  uri: "http://foo.com/...",               // File to load
 *
 *                  listeners: {
 *                        "state-changed" : {
 *                                fn: function(event) {
 *                                       alert("Node " + this.getType() + " has changed state to " + event.params.newState);
 *                                    },
 *                                options: {
 *                                     // Whatever event-handling options are supported (none yet as of V0.7.7)
 *                                }
 *                         },
 *
 *                         // You can specify just the listener's function
 *                         // when there are no options to specify
 *
 *                         "rendering" : function(event) {
 *                                       alert("Node " + this.getType() + " is rendering");
 *                                    }
 *                  }
 *             }
 *        );
 * </code></pre>
 * <p><b>Registering and de-registering listeners on node instances</b></p>
 * <p>This example registers a "state-changed" listener on an existing instance of the node, then removes it again:</p>
 * <pre><code>
 * var handler = function(params) {
 *                  alert("Node " + this.getType() + " has changed state to " + this.getState());
 *              };
 *
 * myLoad.addListener("state-changed", handler);
 *
 * myLoad.removeListener("state-changed", handler);
 * </code></pre>
 *
 * @constructor
 * Create a new SceneJS.Node
 * @param {Object} [cfg] Static configuration object
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {SceneJS.node, ...} arguments Zero or more child nodes
 */
SceneJS.Node = function() {
    this._nodeType = "node";
    this._NODEINFO = null;  // Big and bold, to stand out in debugger object graph inspectors
    this._sid = null;
    this._children = [];
    this._fixedParams = true;
    this._parent = null;
    this._listeners = {};
    this._numListeners = 0; // Useful for quick check whether node observes any events
    this._addedEvents = []; // Events added with #addEvent
    this._eventsOut = []; // FIFO queue for events fired from this node with #fireEvent, flushed after each render

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

    /* Deregister default ID
     */
    if (this._id) {
        SceneJS._nodeIDMap[this._id] = null;
    }

    SceneJS.Node._ArgParser.parseArgs(arguments, this);

    /* Register again by whatever ID we now have
     */
    if (!this._id) {
        this._id = SceneJS._createKeyForMap(SceneJS._nodeIDMap, "n");
    }
    SceneJS._nodeIDMap[this._id] = this;
};

SceneJS.Node.prototype.constructor = SceneJS.Node;

/**
 * A simple recursive descent parser to parse SceneJS's flexible node
 * arguments.
 *
 * @private
 */
SceneJS.Node._ArgParser = new (function() {

    /**
     * Entry point - parse first argument in variable argument list
     */
    this.parseArgs = function(args, node) {
        node._getParams = function() {
            return {};
        };
        node._fixedParams = true;
        node._config = {};

        /* Parse first argument - expected to be either a config object,
         * config callback or a child node
         * @private
         */
        if (args.length > 0) {
            var arg = args[0];
            if (!arg) {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                        ("First element in node config is null or undefined"));
            }
            if (arg instanceof Function) {
                this._parseConfigFunc(arg, args, 1, node);
            } else if (arg._render) {   // Determines arg to be a node
                this._parseChild(arg, args, 1, node);
            } else {
                this._parseConfigObject(arg, args, 1, node);
            }
        }
    };

    /** Parses listeners on a configuration object and registers them on
     * the given node.
     * @private
     */
    this._parseListeners = function(listeners, node) {
        for (var eventName in listeners) {
            if (listeners.hasOwnProperty(eventName)) {
                var l = listeners[eventName];

                /* A listener can be either an object containing a function
                 * and options, or just the function for brevity
                 */
                if (l instanceof Function) {
                    l = {
                        fn: l
                    };
                } else {
                    if (!l.fn) {
                        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                                ("Listener 'fn' missing in node config"));
                    }
                    if (!(l.fn instanceof Function)) {
                        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                                ("Listener 'fn' invalid in node config - is not a function"));
                    }
                }
                l.options = l.options || {};
                if (!node._listeners[eventName]) {
                    node._listeners[eventName] = [];
                }
                node._listeners[eventName].push(l);
                node._numListeners++;
            }
        }
    };

    /**
     * Parse argument that is a configuration object, then parse the next
     * argument (if any) at the given index, which is expected to be either a
     * configuration callback or a child node.
     * @private
     */
    this._parseConfigObject = function(arg, args, i, node) {

        /* Seperate out basic node configs (such as SID, info and listeners) from other configs - set those
         * directly on the node and set the rest on an intermediate config object.
         */
        for (var key in arg) {
            if (arg.hasOwnProperty(key)) {
                if (key == "id") {
                    node._id = arg[key];
                } else if (key == "listeners") {
                    this._parseListeners(arg[key], node);
                } else if (key == "sid") {
                    node._sid = arg[key];
                } else if (key == "info") {
                    node._NODEINFO = arg[key];
                } else {
                    node._config[key] = arg[key];
                }
            }
        }

        node._getParams = (function() {
            var _config = node._config;
            return function() {
                return _config;
            };
        })();

        /* Wind on to next argument if any, expected be either
         * a config callback or a child node
         */
        if (i < args.length) {
            arg = args[i];
            if (arg instanceof Function) {
                this._parseConfigFunc(arg, args, i + 1, node);
            } else if (arg._render) { // Determines arg to be a node
                this._parseChild(arg, args, i + 1, node);
            } else {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                        ("Unexpected type for node argument " + i + " - expected a config function or a child node"));
            }
        }
    };

    /**
     * Parse argument that is a configuration callback, then parse
     * the next argument (if any) at the given index, which is
     * expected to be a child node.
     * @private
     */
    this._parseConfigFunc = function(arg, args, i, node) {
        node._getParams = (function() {
            var _config = node._config;
            var _arg = arg;
            var val;
            return function(data) {
                var c = _arg.call(this, data);
                if (!c) {
                    /* Dynamic config returns nothing - we'll assume this is
                     * explicit, such as when done by a SceneJS.Generator to
                     * signal the end of its generation.
                     */
                    return null;
                }
                var result = {};
                for (var key in _config) {
                    if (_config.hasOwnProperty(key)) {
                        result[key] = _config[key];
                    }
                }
                for (var key in c) {
                    if (c.hasOwnProperty(key)) {
                        val = c[key];   // Don't clobber possible non-null static value with a null dynamic one 
                        if (val != null && val != undefined) {
                            result[key] = val;
                        }
                    }
                }
                return result;
            };
        })();
        node._fixedParams = false;

        /* Wind on to next argument if any, expected be a child node
         */
        if (i < args.length) {
            arg = args[i];
            if (arg._nodeType) {
                this._parseChild(arg, args, i + 1, node);
            } else {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                        ("Unexpected type for node argument " + i + " - expected a child node"));
            }
        }
    };

    /**
     * Parse argument that is a child node, then parse the next
     * argument (if any) at the given index, which is expected to
     * be a child node.
     * @private
     */
    this._parseChild = function(arg, args, i, node) {
        node._children.push(arg);
        arg._parent = node;
        arg._resetMemoLevel(); // In case child is a pruned and grafted subgraph
        if (i < args.length) {
            arg = args[i];
            if (!arg) {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                        ("Node argument " + i + " is null or undefined"));
            }
            if (arg._nodeType) {
                this._parseChild(arg, args, i + 1, node);
            } else {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException
                        ("Unexpected type for node argument " + i + " - expected a child node"));
            }
        }
    };
})();

/**
 * Resets memoization level to zero - called when moving nodes around in graph or calling their setters
 * @private
 */
SceneJS.Node.prototype._resetMemoLevel = function() {
    this._memoLevel = 0;
    for (var i = 0; i < this._children.length; i++) {
        this._children[i]._resetMemoLevel();
    }
};

/** @private
 *
 * Recursively renders a node's child list. This is effectively rendering a subtree,
 * minus the root node, in depth-first, right-to-left order. As this function descends,
 * it tracks in traversalContext the location of each node in relation to the right
 * fringe of the subtree. As soon as the current node has zero children and no right
 * sibling, then it must be the last one in the subtree. If the nodes are part of the
 * subtree of a Symbol node, then a callback will have been planted on the traversalContext
 * by the Instance node that is intiating it. The callback is then called to render the
 * Instance's child nodes as if they were children of the last node.
 */
SceneJS.Node.prototype._renderNodes = function(traversalContext, data, children) {
    var child;
    var childConfigs;
    var i;
    var configUnsetters;

    var savedName;  // Saves SID path for when rendering subgraph of Instance

    if (this._sidPath) {

        /* If this node has a SID path, then it is a Symbol. When a Symbol is rendered, it does not render its own
         * children, instead it registers itself on the Instancing Module and records on itself the SID path of nodes
         * that were visited on the path from the root.
         *
         * We're now here rendering its children as part of the rendering of an Instance node that refers to the Symbol.
         * We're entering the "virtual world" of the Symbol, so we'll set the Symbol's SID path on the Instancing Module
         * to set the current SID name space for the Symbol.
         */
        savedName = SceneJS._instancingModule.getName();
        SceneJS._instancingModule.setName(this._sidPath, this);
    } else if (this._sid) {

        /* If this node has a SID, push it to the instancing module to build up a name space for any Symbols we
         * might be about render within the child subtrees.
         */
        SceneJS._instancingModule.pushName(this._sid, this);
    }

    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {

        /* If in picking mode, notify the Picking Module of our visit to this node
         */
        SceneJS._pickModule.preVisitNode(this);
    }

    children = children || this._children;  // for Selector node
    var numChildren = children.length;
    if (numChildren) {
        var childTraversalContext;
        for (i = 0; i < numChildren; i++) {
            child = children[i];
            configUnsetters = null;
            childConfigs = this._configs || traversalContext.configs;
            if (childConfigs && child._sid) {
                childConfigs = childConfigs[child._sid];
                if (childConfigs) {
                    if (childConfigs instanceof Function) {
                        childConfigs.call(child, data);
                    } else {
                        configUnsetters = this._applyConfigs(childConfigs, traversalContext.configsModes, child, data);
                    }
                }
            }
            childTraversalContext = {
                insideRightFringe: traversalContext.insideRightFringe || (i < numChildren - 1),
                callback : traversalContext.callback,
                configs: childConfigs || traversalContext.configs,
                configsModes : traversalContext.configsModes
            };
            child._renderWithEvents.call(child, childTraversalContext, data);
            if (configUnsetters) {
                this._unsetConfigs(configUnsetters);
            }
        }
    }

    if (numChildren == 0) {
        if (! traversalContext.insideRightFringe) {

            /* No child nodes and on the right fringe - this is the last node in the subtree
             */
            if (traversalContext.callback) {

                /* The node is within the subtree of a Symbol - Instance has provided a
                 * callback to render the Instance's child nodes as if they were children
                 * of the last node in the subtree
                 * of the last node in the subtree
                 */
                traversalContext.callback(traversalContext, data);
            }
        }
    }
    if (savedName) {

        /* Finished visiting children of Symbol. We're leaving the virtual world of the Symbol now,
         * so restore the SID namespace of the caller Instance.
         */
        SceneJS._instancingModule.setName(savedName, this);
    } else if (this._sid) {

        /* Else we're just ascending back up the tree as normal. Pop the SID if we pushed one.
         */
        SceneJS._instancingModule.popName();
    }
};

/**
 * Fires all buffered outgoing events
 * @private
 */
SceneJS.Node.prototype._flushEventsOut = function() {
    var event;
    while (this._eventsOut.length > 0) {
        event = this._eventsOut.pop();
        SceneJS._nodeEventsModule.fireEvent(event.name, event.params);
    }
};

SceneJS.Node.prototype._applyConfigs = function(configs, configsModes, node, data) {
    //    var handle = {
    //        node : node,
    //        setterFuncs : [],
    //        values : []
    //    };
    var handle = null;
    var key;
    var funcName;
    var func;
    var config;
    for (key in configs) {
        if (configs.hasOwnProperty(key)) {
            config = configs[key];
            if (config.isFunc) {
                func = node[key];
                if (func) {
                    if (config.value instanceof Function) {
                        var val = config.value.call(node, data)
                        func.call(node, val);
                    } else {
                        func.call(node, config.value);
                    }
                } else {
                    if (configsModes && configsModes.strictProperties) {
                        throw SceneJS._errorModule.fatalError(new SceneJS.errors.WithConfigsPropertyNotFoundException(
                                "Method '" + funcName + "' expected on node with SID '" + node.getSID() + "'"));
                    }
                }
            }
        }
    }
    return handle; // TODO: restore handle!
};

/**
 * Wraps _render to fire built-in events either side of rendering.
 * @private */
SceneJS.Node.prototype._renderWithEvents = function(traversalContext, data) {
    SceneJS._nodeEventsModule.preVisitNode(this);
    this._processEventsIn();

    /* Apply any configs that were pushed into this node in a "configure" event. We'll also
     * apply any sub-configs within those to children as we descend into those, then forget the
     * configs when we leave this method so we don't keep re-applying them
     */
    if (this._configs) {
       this._applyConfigs(this._configs, traversalContext.configsModes, this, data);
    }

    if (this._numListeners == 0) {
        this._render(traversalContext, data);
    } else {
        if (this._listeners["rendering"]) {
            this._fireEvent("rendering", { });
        }
        this._render(traversalContext, data);
        if (this._listeners["rendered"]) {
            this._fireEvent("rendered", { });
        }
    }
    this._flushEventsOut();
    SceneJS._nodeEventsModule.postVisitNode(this);

    /* Forget any configs we applied
     */
    if (this._configs) {
        this._configs = null;
    }
};

/**
 * Processes all events queued on this node
 * @private
 */
SceneJS.Node.prototype._processEventsIn = function() {
    if (this._addedEvents.length > 0) {

        /* First process any pending events fired directly at this node
         */
        this._processEvents(this._addedEvents);
    }
    var eventsIn = SceneJS._nodeEventsModule.getEvents();
    if (eventsIn) {
        var event;
        while (eventsIn.length > 0) {
            event = eventsIn.pop();
            var list = this._listeners[event.name];
            if (list) {
                if (!event.params) {
                    event.params = {};
                }
                for (var i = 0; i < list.length; i++) {
                    var listener = list[i];
                    listener.fn.call(this, event);
                }

                /* Processing the last event may have indirectly caused
                 * another event to be fired directly at this node - merge the queues
                 */
                if (this._addedEvents.length > 0) {
                    this._processEvents(this._addedEvents);
                }
            }
        }
    }
};

/**
 * @private
 */
SceneJS.Node.prototype._processEvents = function(events) {
    var event;
    while (events.length > 0) {
        event = events.pop();
        if (event.name == "configure") {
            if (event.params && event.params.cfg) { // Silently tolerate missing config
                this._configure(event.params.cfg);
            }
        }
        var list = this._listeners[event.name];
        if (list) {
            if (!event.params) {
                event.params = {};
            }
            for (var i = 0; i < list.length; i++) {
                var listener = list[i];
                listener.fn.call(this, event);
            }
        }
    }
};

SceneJS.Node.prototype._configure = function(configs) {
    this._configs = this._preprocessConfigs(configs);
};

/**
 * Preprocesses configs map into node method calls for fast application when rendering node
 * @param configs
 */
SceneJS.Node.prototype._preprocessConfigs = function(configs) {
    var configAction;
    var funcName;
    var newConfigs = {};
    for (var key in configs) {
        if (configs.hasOwnProperty(key)) {
            key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
            if (key.length > 0) {
                configAction = key.substr(0, 1);
                if (configAction != "#") {  // Property reference
                    if (configAction == "+") {
                        funcName = "add" + key.substr(1, 1).toUpperCase() + key.substr(2);
                    } else if (configAction == "-") {
                        funcName = "remove" + key.substr(1, 1).toUpperCase() + key.substr(2);
                    } else {
                        funcName = "set" + key.substr(0, 1).toUpperCase() + key.substr(1);
                    }
                    newConfigs[funcName] = {
                        isFunc : true,
                        value : configs[key]
                    };

                } else {
                    if (configs[key] instanceof Function) {
                        newConfigs[key.substr(1)] = configs[key];
                    } else {
                        newConfigs[key.substr(1)] = this._preprocessConfigs(configs[key]);
                    }
                }
            }
        }
    }
    return newConfigs;
};


/** @private */
SceneJS.Node.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams.call(this, data));
    }
    this._renderNodes(traversalContext, data);
};

// @private
SceneJS.Node.prototype._unsetConfigs = function(handle) {
    for (var i = handle.setterFuncs.length - 1; i >= 0; i--) {
        handle.setterFuncs[i].call(handle.child, handle.values[i]);
    }
};

/** @private */
SceneJS.Node.prototype._renderNode = function(index, traversalContext, data) {
    if (index >= 0 && index < this._children.length) {
        var child = this._children[index];
        var childConfigs = traversalContext.configs;
        if (childConfigs && child._sid) {
            childConfigs = childConfigs["#" + child._sid];
            if (childConfigs) {
                var handle = this._applyConfigs(childConfigs, traversalContext.configsModes, child);
                child._render.call(child, traversalContext, data);
                this._unsetConfigs(handle);
                return;
            }
        }
        child._render.call(child, traversalContext, data);
    }
};

/**
 * Returns the SceneJS-assigned ID of the node.
 * @returns {string} Node's ID
 */
SceneJS.Node.prototype.getID = function() {
    return this._id;
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
 * Returns the node's optional subidentifier, which must be unique within the scope
 * of the parent node.
 * @returns {string} Node SID
 */
SceneJS.Node.prototype.getSID = function() {
    return this._sid;
};

/**
 * Returns the node's optional information string. The string will be empty if never set.
 * @returns {string} Node info string
 */
SceneJS.Node.prototype.getInfo = function() {
    return this._NODEINFO || "";
};

/**
 * Sets the node's optional information string. The string will be empty if never set.
 * @param {string} info Node info string
 */
SceneJS.Node.prototype.setInfo = function(info) {
    this._NODEINFO = info;
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

/** Returns child node at given index. Returns null if no node at that index.
 * @param {Number} index The child index
 * @returns {SceneJS.Node} Child node, or null if not found
 */
SceneJS.Node.prototype.getNodeAt = function(index) {
    if (index < 0 || index >= this._children.length) {
        return null;
    }
    return this._children[index];
};

/** Returns child node with the given SID (structure identifier).
 * Returns null if no such child node found.
 * @param {String} sid The child's SID
 * @returns {SceneJS.Node} Child node, or null if not found
 */
SceneJS.Node.prototype.getNode = function(sid) {
    for (var i = 0; i < this._children.length; i++) {
        if (this._children[i].getSID() == sid) {
            return this._children[i];
        }
    }
    return null;
};

/** Removes the child node at the given index
 * @param {int} index Child node index
 * @returns {SceneJS.Node} The removed child node if located, else null
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

/** Removes the child node with the given SID (structural identifier) string.
 * @param {String} sid The target child node's SID
 * @returns {SceneJS.Node} The removed child node if located, else null
 */
SceneJS.Node.prototype.removeNode = function(sid) {
    if (!sid) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidSceneGraphException(
                        "SceneJS.Node#removeNode - target node not defined"));
    }
    for (var i = 0; i < this._children.length; i++) {
        if (this._children[i].getSID() == sid) {
            return this.removeNodeAt(i);
        }
    }
    return null;
};


/** Appends multiple child nodes
 * @param {Array[SceneJS.Node]} nodes Array of nodes
 * @return {SceneJS.Node} This node
 */
SceneJS.Node.prototype.addNodes = function(nodes) {
    if (!nodes) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidSceneGraphException(
                        "SceneJS.Node#addNodes - nodes argument is undefined"));
    }
    for (var i = nodes.length - 1; i >= 0; i--) {
        this.addNode(nodes[i]);
    }
    return this;
};


/** Appends a child node
 * @param {SceneJS.Node} node Child node
 * @return {SceneJS.Node} The child node
 */
SceneJS.Node.prototype.addNode = function(node) {
    if (!node) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidSceneGraphException(
                        "SceneJS.Node#addNode - node argument is undefined"));
    }
    if (!node._render) {
        node = SceneJS.createNode(node);
    }
    if (!node._render) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidSceneGraphException(
                        "SceneJS.Node#addNode - node argument is not a SceneJS.Node or subclass!"));
    }
    if (node._parent != null) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidSceneGraphException(
                        "SceneJS.Node#addNode - node argument is still attached to another parent!"));
    }
    this._children.push(node);
    node._parent = this;
    node._resetMemoLevel();
    return node;
};

/** @private
 */
SceneJS.Node.prototype.findNodeIndex = function(sid) {
    for (var i = 0; i < this._children.length; i++) {
        if (this._children[i].getSID() == sid) {
            return i;
        }
    }
    return -1;
};

/** Inserts a child node
 * @param {SceneJS.Node} node Child node
 * @param {int} i Index for new child node
 * @return {SceneJS.Node} The child node
 */
SceneJS.Node.prototype.insertNode = function(node, i) {
    if (node._parent != null) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidSceneGraphException(
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
 *              }
 * );
 *
 *
 * </code></pre>
 *
 * @param {String} eventName One of the event types supported by this node
 * @param fn - Handler function that be called as specified
 * @param options - Optional options for the handler as specified
 * @return {SceneJS.Node} this
 */
SceneJS.Node.prototype.addListener = function(eventName, fn, options) {
    var list = this._listeners[eventName];
    if (!list) {
        list = [];
        this._listeners[eventName] = list;
    }
    list.push({
        eventName : eventName,
        fn: fn,
        options : options || {}
    });
    this._numListeners++;
    return this;
};

/**
 * Fires an event at this node
 * @param {String} eventName Event name
 * @param {Object} params Event parameters
 */
SceneJS.Node.prototype._fireEvent = function(eventName, params) {
    var list = this._listeners[eventName];
    if (list) {
        if (!params) {
            params = {};
        }
        var event = { name: eventName, params : params };
        for (var i = 0; i < list.length; i++) {
            var listener = list[i];
            listener.fn.call(this, event);
        }
    }
};

/**
 * Adds an event to a FIFO queue for the given event type, to be processed when the node is next rendered.
 * @param {String} event.name Event name
 * @param {Object} event.params Event parameters
 * @param {String} event.uri Relative SID path to event source node
 * @return this
 */
SceneJS.Node.prototype.addEvent = function(event) { // TODO: not enqeue event when node has no listeners?
    this._addedEvents.unshift(event);
    return this;
};

/**
 * Called when this node is being rendered, to fire an event up the path of super-nodes that have been traversed to
 * arrive at this node, to be processed by those super-nodes that have corresponding listeners, if and when those nodes
 * are rendered on the next scene traversal.
 *
 * @param {String} name Event name
 * @param {Object} params Event parameters
 * @return this
 */
SceneJS.Node.prototype.fireEvent = function(name, params) {
    this._eventsOut.unshift({ name: name, params : params });
    return this;
};

/**
 * Removes a handler that is registered for the given event on this node.
 * Does nothing if no such handler registered.
 *
 * @param {String} eventName Event type that handler is registered for
 * @param {function} fn - Handler function that is registered for the event
 * @return {function} The handler, or null if not registered
 */
SceneJS.Node.prototype.removeListener = function(eventName, fn) {
    var list = this._listeners[eventName];
    if (!list) {
        return null;
    }
    for (var i = 0; i < list.length; i++) {
        if (list[i].fn == fn) {
            list.splice(i, 1);
            return fn;
        }
    }
    this._numListeners--;
    return null;
};

/**
 * Returns true if this node has any listeners for the given event .
 *
 * @param {String} eventName Event type
 * @return {boolean} True if listener present
 */
SceneJS.Node.prototype.hasListener = function(eventName) {
    return this._listeners[eventName];
};

/**
 * Returns true if this node has any listeners at all.
 *
 * @return {boolean} True if any listener present
 */
SceneJS.Node.prototype.hasListeners = function() {
    return (this._numListeners > 0);
};

/** Removes all listeners registered on this node.
 * @return {SceneJS.Node} this
 */
SceneJS.Node.prototype.removeListeners = function() {
    this._listeners = {};
    this._numListeners = 0;
    return this;
};

/** Returns the parent node
 * @return {SceneJS.Node} The parent node
 */
SceneJS.Node.prototype.getParent = function() {
    return this._parent;
};

/** Returns either all child or all sub-nodes of the given type, depending on whether search is recursive or not.
 * @param {string} type Node type
 * @param {boolean} [recursive=false] When true, will return all matching nodes in subgraph, otherwise returns just children (default)
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

/** Factory function that returns a new {@link SceneJS.Node} instance
 * @param {Object} [cfg] Static configuration object
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {SceneJS.node, ...} arguments Zero or more child nodes
 * @returns {SceneJS.Node}
 */
SceneJS.node = function() {
    var n = new SceneJS.Node();
    SceneJS.Node.prototype.constructor.apply(n, arguments);
    return n;
};


SceneJS.registerNodeType("node", SceneJS.node);


