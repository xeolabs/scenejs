/**
 * @class The basic scene graph node type
 */
SceneJS.Node = function () {
};

/**
 * @class Basic scene graph node
 */
SceneJS.Node.prototype.constructor = SceneJS.Node;

/**
 * Called by SceneJS_Engine after it has instantiated the node
 *
 * @param {SceneJS_Engine} engine The engine which will manage this node
 * @param {SceneJS_Core} core The core which will hold state for this node, may be shared with other nodes of the same type
 * @param cfg Configuration for this node
 * @param {String} cfg.id ID for the node, unique among all nodes in the scene
 * @param {String} cfg.type type Type of this node (eg. "material", "texture" etc)
 * @param {Object} cfg.data Optional arbitrary JSON object to attach to node
 * @param {String} nodeId Optional ID for node
 */
SceneJS.Node.prototype._construct = function (engine, core, cfg, nodeId) {

    /**
     * Engine that manages this node
     * @type SceneJS_Engine
     */
    this._engine = engine;

    /**
     * The core which holds state for this node, may be shared with other nodes of the same type
     * @type SceneJS_Core
     */
    this._core = core;

    /**
     * ID of this node, unique within its scene. The ID is a string if it was defined by the application
     * via the node's JSON configuration, otherwise it is a number if it was left to SceneJS to automatically create.
     * @type String|Number
     */
    this.id = cfg.id || cfg.nodeId || nodeId;

    /**
     * Type of this node (eg. "material", "texture" etc)
     * @type String
     */
    this.type = cfg.type || "node";

    /**
     * Optional arbitrary JSON object attached to this node
     * @type JSON
     */
    this.data = cfg.data;

    /**
     * Parent node
     * @type SceneJS.Node
     */
    this.parent = null;

    /**
     * Child nodes
     * @type SceneJS.Node[]
     */
    this.nodes = [];

    // Pub/sub support
    this._handleMap = new SceneJS_Map(); // Subscription handle pool
    this._topicSubs = {}; // A [handle -> callback] map for each topic name
    this._handleTopics = {}; // Maps handles to topic names
    this._topicPubs = {}; // Maps topics to publications

    /**
     *
     */
    this._listeners = {};

    /**
     *
     */
    this._numListeners = 0; // Useful for quick check whether node observes any events

    /**
     *
     */
    this.dirty = false;

    /**
     *
     */
    this.branchDirty = false;

    if (this._init) {
        this._init(cfg);
    }
};

/**
 * Notifies that an asynchronous task has started on this node
 * @param {String} [description] Description - will be "Task" by default
 * @return {String} Unique ID for the task, which may be given to {@link #taskFinished} or {@link #taskFailed}
 */
SceneJS.Node.prototype.taskStarted = function (description) {
    return SceneJS_sceneStatusModule.taskStarted(this, description || "Task");
};

/**
 * Notifies that a task, whose initiation was previously notified with {@link #taskStarted},
 * has now completed successfully.
 * @param {String} taskId Unique ID for the task, which was got with {@link #taskStarted}
 * @return null
 */
SceneJS.Node.prototype.taskFinished = function (taskId) {
   return SceneJS_sceneStatusModule.taskFinished(taskId);
};

/**
 * Notifies that a task, whose initiation was previously notified with {@link #taskStarted},
 * has failed.
 * @param {String} taskId Unique ID for the task, which was got with {@link #taskStarted}
 * @return null
 */
SceneJS.Node.prototype.taskFailed = function (taskId) {
    return SceneJS_sceneStatusModule.taskFailed(taskId);
};

/**
 * Publishes to a topic on this node.
 *
 * Immediately notifies existing subscriptions to that topic, and unless the "forget' parameter is
 * true, retains the publication to give to any subsequent notifications on that topic as they are made.
 *
 * @param {String} topic Publication topic
 * @param {Object} pub The publication
 * @param {Boolean} [forget] When true, the publication will be sent to subscribers then forgotten, so that any
 * subsequent subscribers will not receive it
 * @private
 */
SceneJS.Node.prototype.publish = function (topic, pub, forget) {
    if (!forget) {
        this._topicPubs[topic] = pub; // Save notification
    }
    var subsForTopic = this._topicSubs[topic];
    if (subsForTopic) { // Notify subscriptions
        for (var handle in subsForTopic) {
            if (subsForTopic.hasOwnProperty(handle)) {
                subsForTopic[handle].call(this, pub);
            }
        }
    }
};

/**
 * Removes a topic publication
 *
 * Immediately notifies existing subscriptions to that topic, sending them each a null publication.
 *
 * @param topic Publication topic
 * @private
 */
SceneJS.Node.prototype.unpublish = function (topic) {
    var subsForTopic = this._topicSubs[topic];
    if (subsForTopic) { // Notify subscriptions
        for (var handle in subsForTopic) {
            if (subsForTopic.hasOwnProperty(handle)) {
                subsForTopic[handle].call(this, null);
            }
        }
    }
    delete this._topicPubs[topic];
};


/**
 * Listen for data changes at a particular location on this node
 *
 * <p>Your callback will be triggered for
 * the initial data and again whenever the data changes. Use {@link #off} to stop receiving updates.</p>
 *
 * <p>The callback is be called with this node as scope.</p>
 *
 * @param {String} location Publication location
 * @param {Function(data)} callback Called when fresh data is available at the location
 * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
 */
SceneJS.Node.prototype.on = function (topic, callback) {
    var subsForTopic = this._topicSubs[topic];
    if (!subsForTopic) {
        subsForTopic = {};
        this._topicSubs[topic] = subsForTopic;
    }
    var handle = this._handleMap.addItem(); // Create unique handle
    subsForTopic[handle] = callback;
    this._handleTopics[handle] = topic;
    var pub = this._topicPubs[topic];
    if (pub) { // A publication exists, notify callback immediately
        callback.call(this, pub);
    }
    //else {
    if (topic == "rendered") {
        this._engine.branchDirty(this);
    }
    // }
    return handle;
};

/**
 * Unsubscribes from a publication on this node that was previously made with {@link #on}.
 * @param handle Publication handle
 */
SceneJS.Node.prototype.off = function (handle) {
    var topic = this._handleTopics[handle];
    if (topic) {
        delete this._handleTopics[handle];
        var topicSubs = this._topicSubs[topic];
        if (topicSubs) {
            delete topicSubs[handle];
        }
        this._handleMap.removeItem(handle); // Release handle
        if (topic == "rendered") {
            this._engine.branchDirty(this);
        }
    }
};

/**
 * Listens for exactly one data update at the specified location on this node, and then stops listening.
 * <p>This is equivalent to calling {@link #on}, and then calling {@link #off} inside the callback function.</p>
 * @param {String} location Data location to listen to
 * @param {Function(data)} callback Called when fresh data is available at the location
 */
SceneJS.Node.prototype.once = function (topic, callback) {
    var self = this;
    var sub = this.on(topic,
        function (pub) {
            self.off(sub);
            callback(pub);
        });
};

/**
 * Returns this node's {@link SceneJS.Scene}
 */
SceneJS.Node.prototype.getScene = function () {
    return this._engine.scene;
};

/**
 * Returns the ID of this node's core
 */
SceneJS.Node.prototype.getCoreId = function () {
    return this._core.coreId;
};

/**
 * Get the node's ID
 *
 */
SceneJS.Node.prototype.getID = function () {
    return this.id;
};

/**
 * Alias for getID
 *  @function
 */
SceneJS.Node.prototype.getId = function () {
    return this.id;
};

/**
 * Alias for getID
 *  @function
 */
SceneJS.Node.prototype.getNodeId = function () {
    return this.id;
};


/**
 * Returns the node's type. For the Node base class, it is "node", overridden in sub-classes.
 */
SceneJS.Node.prototype.getType = function () {
    return this.type;
};

/**
 * Returns the data object attached to this node.
 */
SceneJS.Node.prototype.getData = function () {
    return this.data;
};

/**
 * Sets a data object on this node.
 */
SceneJS.Node.prototype.setData = function (data) {
    this.data = data;
    return this;
};

/**
 * Returns the number of child nodes
 */
SceneJS.Node.prototype.getNumNodes = function () {
    return this.nodes.length;
};

/** Returns child nodes
 * @returns {Array} Child nodes
 */
SceneJS.Node.prototype.getNodes = function () {
    return this.nodes.slice(0);
};

/** Returns child node at given index. Returns null if no node at that index.
 * @param {Number} index The child index
 * @returns {Node} Child node, or null if not found
 */
SceneJS.Node.prototype.getNodeAt = function (index) {
    if (index < 0 || index >= this.nodes.length) {
        return null;
    }
    return this.nodes[index];
};

/** Returns first child node. Returns null if no child nodes.
 * @returns {Node} First child node, or null if not found
 */
SceneJS.Node.prototype.getFirstNode = function () {
    if (this.nodes.length == 0) {
        return null;
    }
    return this.nodes[0];
};

/** Returns last child node. Returns null if no child nodes.
 * @returns {Node} Last child node, or null if not found
 */
SceneJS.Node.prototype.getLastNode = function () {
    if (this.nodes.length == 0) {
        return null;
    }
    return this.nodes[this.nodes.length - 1];
};

/** Returns child node with the given ID.
 * Returns null if no such child node found.
 */
SceneJS.Node.prototype.getNode = function (id) {
    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].id == id) {
            return this.nodes[i];
        }
    }
    return null;
};

/** Disconnects the child node at the given index from its parent node
 * @param {int} index Child node index
 * @returns {Node} The disconnected child node if located, else null
 */
SceneJS.Node.prototype.disconnectNodeAt = function (index) {
    var r = this.nodes.splice(index, 1);
    if (r.length > 0) {
        r[0].parent = null;
        this._engine.display.objectListDirty = true;
        return r[0];
    } else {
        return null;
    }
};

/** Disconnects the child node from its parent, given as a node object
 * @param {String | Node} id The target child node, or its ID
 * @returns {Node} The removed child node if located
 */
SceneJS.Node.prototype.disconnect = function () {
    if (this.parent) {
        for (var i = 0; i < this.parent.nodes.length; i++) {
            if (this.parent.nodes[i] === this) {
                return this.parent.disconnectNodeAt(i);
            }
        }
    }
    return null;
};

/** Removes the child node at the given index
 * @param {int} index Child node index
 */
SceneJS.Node.prototype.removeNodeAt = function (index) {
    var child = this.disconnectNodeAt(index);
    if (child) {
        child.destroy();
        this._engine.display.objectListDirty = true;
    }
};

/** Removes the child node, given as either a node object or an ID string.
 * @param {String | Node} id The target child node, or its ID
 * @returns {Node} The removed child node if located
 */
SceneJS.Node.prototype.removeNode = function (node) {

    if (!node) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "Node#removeNode - node argument undefined");
    }

    if (!node._compile) {
        if (typeof node == "string") {
            var gotNode = this._engine.findNode(node);
            if (!gotNode) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_NOT_FOUND,
                    "Node#removeNode - node not found anywhere: '" + node + "'");
            }
            node = gotNode;
        }
    }

    if (node._compile) { //  instance of node
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === node) {
                var removedNode = this.removeNodeAt(i);
                this._engine.display.objectListDirty = true;
                return removedNode;
            }
        }
    }

    throw SceneJS_error.fatalError(
        SceneJS.errors.NODE_NOT_FOUND,
        "Node#removeNode - child node not found: " + (node._compile ? ": " + node.id : node));
};

/** Disconnects all child nodes from their parent node and returns them in an array.
 */
SceneJS.Node.prototype.disconnectNodes = function () {

    var len = this.nodes.length;

    for (var i = 0; i < len; i++) {  // Unlink nodes from this
        this.nodes[i].parent = null;
    }

    var nodes = this.nodes;

    this.nodes = [];

    this._engine.display.objectListDirty = true;

    return nodes;
};

/** Removes all child nodes and returns them in an array.
 */
SceneJS.Node.prototype.removeNodes = function () {
    var nodes = this.disconnectNodes();
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].destroy();
        this._engine.display.objectListDirty = true;
    }
};

/** Destroys this node and moves children up to parent, inserting them where this node resided.
 */
SceneJS.Node.prototype.splice = function () {

    var i, len;

    if (this.parent == null) {
        return null;
    }
    var parent = this.parent;
    var nodes = this.disconnectNodes();
    for (i = 0, len = nodes.length; i < len; i++) {  // Link this node's nodes to new parent
        nodes[i].parent = this.parent;
    }
    for (i = 0, len = parent.nodes.length; i < len; i++) { // Replace node on parent's nodes with this node's nodes
        if (parent.nodes[i] === this) {

            parent.nodes.splice.apply(parent.nodes, [i, 1].concat(nodes));

            this.nodes = [];
            this.parent = null;

            this.destroy();

            this._engine.branchDirty(parent);

            return parent;
        }
    }
};

/** Appends multiple child nodes
 */
SceneJS.Node.prototype.addNodes = function (nodes, ok) {

    if (!nodes) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "Node#addNodes - nodes argument is undefined");
    }

    var node;
    var result = [];
    var numNodes = nodes.length;

    for (var i = nodes.length - 1; i >= 0; i--) {
        var nodeAttr = nodes[i];
        if (nodeAttr.type == "node" || this._engine.hasNodeType(nodeAttr.type)) {

            // Add loaded node type synchronously

            node = this.addNode(nodeAttr);
            result[i] = node;
            if (--numNodes == 0) {
                if (ok) {
                    ok(nodes);
                }
                return nodes;
            }
        } else {

            // Load node type and instantiate it asynchronously

            var self = this;
            (function () {
                var nodei = i;
                self.addNode(nodeAttr,
                    function (node) {
                        result[nodei] = node;
                        if (--numNodes == 0) {
                            if (ok) {
                                ok(nodes);
                            }
                        }
                    });
            })();
        }
    }
    return null;
};

/** Appends a child node
 */
SceneJS.Node.prototype.addNode = function (node, ok) {

    node = node || {};

    // Graft node object
    if (node._compile) {
        if (node.parent != null) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is still attached to another parent");
        }
        this.nodes.push(node);
        node.parent = this;
        this._engine.branchDirty(node);
        if (ok) {
            ok(node);
        }
        return node;
    }

    // Graft node object by ID reference
    if (typeof node == "string") {
        var gotNode = this._engine.findNode(node);
        if (!gotNode) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node not found: '" + node + "'");
        }
        node = gotNode;
        if (node.parent != null) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is still attached to another parent");
        }
        this.nodes.push(node);
        node.parent = this;
        this._engine.branchDirty(node);
        if (ok) {
            ok(node);
        }
        return node;
    }

    // Create node
    if (node.type == "node" || this._engine.hasNodeType(node.type)) {

        // Root node's type is already loaded, so we are able
        // to create the root synchronously. When the caller
        // is creating a core node type, then by this contract
        // it can rely on the return value

        node = this._engine.createNode(node);
        this.nodes.push(node);
        node.parent = this;
        this._engine.branchDirty(node);
        if (ok) {
            ok(node);
        }
        return node;

    } else {

        // Otherwise the root node's type needs to be loaded,
        // so we need to create it asynchronously. By this contract,
        // the Caller would not rely on synchronous creation of
        // non-core types.

        var self = this;
        this._engine.createNode(node,
            function (node) {
                self.nodes.push(node);
                node.parent = self;
                self._engine.branchDirty(node);
                if (ok) {
                    ok(node);
                }
            });
        return null;
    }
};

/** Inserts a subgraph into child nodes
 * @param {Node} node Child node
 * @param {int} i Index for new child node
 * @return {Node} The child node
 */
SceneJS.Node.prototype.insertNode = function (node, i) {

    if (!node) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node argument is undefined");
    }

    if (!node._compile) { // JSON node definition
        node = this._engine.createNode(node); // Create node
    }

    if (!node._compile) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node argument is not a SceneJS.Node");
    }

    if (node.parent != null) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node argument is still attached to another parent");
    }

    if (i === undefined || i === null) {
        node.addNodes(this.disconnectNodes());
        this.addNode(node);

    } else if (i < 0) {

        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node index out of range: -1");

    } else if (i >= this.nodes.length) {
        this.nodes.push(node);
    } else {
        this.nodes.splice(i, 0, node);
    }

    node.parent = this;
    return node;
};

/** Calls the given function on each node in the subgraph rooted by this node, including this node.
 * The callback takes each node as it's sole argument and traversal stops as soon as the function returns
 * true and returns the node.
 * @param {function(Node)} func The function
 */
SceneJS.Node.prototype.mapNodes = function (func) {
    if (func(this)) {
        return this;
    }
    var result;
    for (var i = 0; i < this.nodes.length; i++) {
        result = this.nodes[i].mapNodes(func);
        if (result) {
            return result;
        }
    }
    return null;
};

/**
 * Registers a listener for a given event on this node. If the event type
 * is not supported by this node type, then the listener will never be called.
 * <p><b>Example:</b>
 * <pre><code>
 * var node = new Node();
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
 * @param {Function} fn - Handler function that be called as specified
 * @param options - Optional options for the handler as specified
 * @return {Node} this
 */
SceneJS.Node.prototype.addListener = function (eventName, fn, options) {
    var list = this._listeners[eventName];
    if (!list) {
        list = [];
        this._listeners[eventName] = list;
    }
    list.push({
        eventName:eventName,
        fn:fn,
        options:options || {}
    });
    this._numListeners++;
    return this;
};

/**
 * Fires an event at this node, immediately calling listeners registered for the event
 */
SceneJS.Node.prototype._fireEvent = function (eventName, params, options) {
    var list = this._listeners[eventName];
    if (list) {
        if (!params) {
            params = {};
        }
        var event = {
            name:eventName,
            params:params,
            options:options || {}
        };
        var listener;
        for (var i = 0, len = list.length; i < len; i++) {
            listener = list[i];
            if (listener.options.scope) {
                listener.fn.call(listener.options.scope, event);
            } else {
                listener.fn.call(this, event);
            }
        }
    }
};

/**
 * Removes a handler that is registered for the given event on this node.
 * Does nothing if no such handler registered.
 */
SceneJS.Node.prototype.removeListener = function (eventName, fn) {
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
 * Returns true if this node has any listeners for the given event
 */
SceneJS.Node.prototype.hasListener = function (eventName) {
    return this._listeners[eventName];
};

/**
 * Returns true if this node has any listeners at all.
 */
SceneJS.Node.prototype.hasListeners = function () {
    return (this._numListeners > 0);
};

/** Removes all listeners registered on this node.
 */
SceneJS.Node.prototype.removeListeners = function () {
    this._listeners = {};
    this._numListeners = 0;
    return this;
};

/** Returns the parent node
 */
SceneJS.Node.prototype.getParent = function () {
    return this.parent;
};

/**
 * Iterates over parent nodes on the path from the selected node to the root, executing a function
 * for each.
 * If the function returns true at any node, then traversal stops and a selector is
 * returned for that node.
 * @param {Function(node, index)} fn Function to execute on each instance node
 * @return {Object} Selector for selected node, if any
 */
SceneJS.Node.prototype.eachParent = function (fn) {

    if (!fn) {
        throw "SceneJS.Node.eachParent param 'fn' is null or undefined";
    }

    var count = 0;
    var node = this;

    while (node.parent) {
        if (fn.call(node.parent, count++) === true) {
            return node.parent;
        }
        node = node.parent;
    }

    return null;
};

/** Returns true if a child node matching given ID or index exists on this node
 * @param {Number|String} node Child node index or ID
 */
SceneJS.Node.prototype.hasNode = function (node) {

    if (node === null || node === undefined) {
        throw "SceneJS.Node.hasNode param 'node' is null or undefined";
    }

    var type = typeof node;
    var nodeGot;

    if (type == "number") {
        nodeGot = this.getNodeAt(node);

    } else if (type == "string") {
        nodeGot = this.getNode(node);

    } else {
        throw "SceneJS.Node.hasNode param 'node' should be either an index number or an ID string";
    }

    return (nodeGot != undefined && nodeGot != null);
};

/** Selects a child node matching given ID or index
 * @param {Number|String} node Child node index or ID
 */
SceneJS.Node.prototype.node = function (node) {

    if (node === null || node === undefined) {
        throw "SceneJS.Node.node param 'node' is null or undefined";
    }

    var type = typeof node;
    var nodeGot;

    if (type == "number") {
        nodeGot = this.getNodeAt(node);

    } else if (type == "string") {
        nodeGot = this.getNode(node);

    } else {
        throw "SceneJS.Node.node param 'node' should be either an index number or an ID string";
    }

    if (!nodeGot) {
        throw "SceneJS.Node.node - node not found: '" + node + "'";
    }

    return nodeGot;
};

/**
 * Iterates over sub-nodes of the selected node, executing a function
 * for each. With the optional options object we can configure is depth-first or breadth-first order.
 * If neither, then only the child nodes are iterated.
 * If the function returns true at any node, then traversal stops and a selector is
 * returned for that node.
 * @param {Function(index, node)} fn Function to execute on each child node
 * @return {Object} Selector for selected node, if any
 */
SceneJS.Node.prototype.eachNode = function (fn, options) {

    if (!fn) {
        throw "SceneJS.Node.eachNode param 'fn' is null or undefined";
    }

    if (typeof fn != "function") {
        throw "SceneJS.Node.eachNode param 'fn' should be a function";
    }

    var stoppedNode;
    options = options || {};
    var count = 0;

    if (options.andSelf) {
        if (fn.call(this, count++) === true) {
            return this;
        }
    }

    if (!options.depthFirst && !options.breadthFirst) {
        stoppedNode = this._iterateEachNode(fn, this, count);

    } else if (options.depthFirst) {
        stoppedNode = this._iterateEachNodeDepthFirst(fn, this, count, false); // Not below root yet

    } else {
        // TODO: breadth-first
    }

    if (stoppedNode) {
        return stoppedNode;
    }

    return undefined; // IDE happy now
};

SceneJS.Node.prototype.numNodes = function () {
    return this.nodes.length;
};

SceneJS.Node.prototype._iterateEachNode = function (fn, node, count) {

    var len = node.nodes.length;
    var child;

    for (var i = 0; i < len; i++) {
        child = node.nodes[i];

        if (fn.call(child, count++) === true) {
            return child;
        }
    }

    return null;
};

SceneJS.Node.prototype._iterateEachNodeDepthFirst = function (fn, node, count, belowRoot) {

    if (belowRoot) {

        /* Visit this node - if we are below root, because entry point visits the root
         */
        if (fn.call(node, count++) === true) {
            return node;
        }
    }

    belowRoot = true;

    /* Iterate nodes
     */
    var len = node.nodes.length;
    var child;
    for (var i = 0; i < len; i++) {
        child = this._iterateEachNodeDepthFirst(fn, node.nodes[i], count, belowRoot);
        if (child) {
            return child;
        }
    }

    return null;
};

/** Returns either all child or all sub-nodes of the given type, depending on whether search is recursive or not.
 */
SceneJS.Node.prototype.findNodesByType = function (type, recursive) {
    return this._findNodesByType(type, [], recursive);
};

SceneJS.Node.prototype._findNodesByType = function (type, list, recursive) {
    var i;
    for (i = 0; i < this.nodes; i++) {
        var node = this.nodes[i];
        if (node.type == type) {
            list.add(node);
        }
    }
    if (recursive) {
        for (i = 0; i < this.nodes; i++) {
            this.nodes[i]._findNodesByType(type, list, recursive);
        }
    }
    return list;
};

/** Finds the first node on path up to root whose type equals that given
 */
SceneJS.Node.prototype.findParentByType = function (type) {
    var parent = this.parent;
    while (parent && parent.type != type) {
        parent = parent.parent;
    }
    return parent;
};


/**
 * Given a map of name-value pairs, calls a getter method for each name,
 * feeding into it the corresponding value.
 *
 * @param attr
 * @param value
 * @return {*}
 */
SceneJS.Node.prototype.set = function (attr, value) {

    if (typeof attr == "object") { // Attribute map - recurse for each attribute
        for (var subAttr in attr) {
            if (attr.hasOwnProperty(subAttr)) {
                this.set(subAttr, attr[subAttr]);
            }
        }
        return;
    }

    if (this._set) {
        var method = this._set[attr];
        if (method) {
            return method.call(this, value);
        }
    }

    return this._createAccessor("set", attr, value);
};

SceneJS.Node.prototype.get = function (attr) {

    if (this._get) {
        var method = this._get[attr];
        if (method) {
            return method.call(this);
        }
    }

    return this._createAccessor("get", attr);
};

SceneJS.Node.prototype.add = function (attr, value) {

    if (typeof attr == "object") { // Attribute map - recurse for each attribute
        for (var subAttr in attr) {
            if (attr.hasOwnProperty(subAttr)) {
                this.add(subAttr, attr[subAttr]);
            }
        }
        return;
    }

    if (this._add) {
        var method = this._add[attr];
        if (method) {
            return method.call(this, value);
        }
    }

    return this._createAccessor("add", attr, value);
};

SceneJS.Node.prototype.inc = function (attr, value) {

    if (typeof attr == "object") { // Attribute map - recurse for each attribute
        for (var subAttr in attr) {
            if (attr.hasOwnProperty(subAttr)) {
                this.inc(subAttr, attr[subAttr]);
            }
        }
        return;
    }

    if (this._inc) {
        var method = this._inc[attr];
        if (method) {
            return method.call(this, value);
        }
    }

    return this._createAccessor("inc", attr, value);
};

SceneJS.Node.prototype.insert = function (attr, value) {

    if (typeof attr == "object") { // Attribute map - recurse for each attribute
        for (var subAttr in attr) {
            if (attr.hasOwnProperty(subAttr)) {
                this.insert(subAttr, attr[subAttr]);
            }
        }
        return;
    }

    if (this._set) {
        var method = this._set[attr];
        if (method) {
            return method.call(this, value);
        }
    }

    return this._createAccessor("insert", attr, value);
};

SceneJS.Node.prototype.remove = function (attr, value) {

    if (typeof attr == "object") { // Attribute map - recurse for each attribute
        for (var subAttr in attr) {
            if (attr.hasOwnProperty(subAttr)) {
                this.remove(subAttr, attr[subAttr]);
            }
        }
        return;
    }

    if (this._remove) {
        var method = this._remove[attr];
        if (method) {
            return method.call(this, value);
        }
    }

    return this._createAccessor("remove", attr, value);
};

SceneJS.Node.prototype._createAccessor = function (op, attr, value) {

    var methodName = op + attr.substr(0, 1).toUpperCase() + attr.substr(1);

    var method = this[methodName];

    if (!method) {
        throw "Method not found on node: '" + methodName + "'";
    }

    //var proto = (this.type == "node") ? SceneJS.Node.prototype : this._engine.nodeTypes[this.type].prototype;

    var proto = this.__proto__;

    var accessors;
    switch (op) {
        case "set":
            accessors = (proto._set || (proto._set = {}));
            break;

        case "get":
            accessors = (proto._get || (proto._get = {}));
            break;

        case "inc":
            accessors = (proto._inc || (proto._inc = {}));
            break;

        case "add":
            accessors = (proto._add || (proto._add = {}));
            break;

        case "insert":
            accessors = (proto._insert || (proto._insert = {}));
            break;

        case "remove":
            accessors = (proto._remove || (proto._remove = {}));
            break;
    }

    accessors[attr] = method;

    return method.call(this, value); // value can be undefined
};

/** Binds a listener to an event on the selected node
 *
 * @param {String} name Event name
 * @param {Function} handler Event handler
 */
SceneJS.Node.prototype.bind = function (name, handler) {

    if (!name) {
        throw "SceneJS.Node.bind param 'name' null or undefined";
    }

    if (typeof name != "string") {
        throw "SceneJS.Node.bind param 'name' should be a string";
    }

    if (!handler) {
        throw "SceneJS.Node.bind param 'handler' null or undefined";
    }

    if (typeof handler != "function") {
        throw "SceneJS.Node.bind param 'handler' should be a function";
    }

    this.addListener(name, handler, { scope:this });

    this._engine.branchDirty(this);

    return handler;
};

/**
 * Returns an object containing the attributes that were given when creating the node. Obviously, the map will have
 * the current values, plus any attributes that were later added through set/add methods on the node
 *
 */
SceneJS.Node.prototype.getJSON = function () {
    return this;
};


SceneJS.Node.prototype._compile = function () {
    if (this.preCompile) {
        this.preCompile();
    }
    this._compileNodes();
    if (this.postCompile) {
        this.postCompile();
    }
};

SceneJS.Node.prototype._compileNodes = function () {

    var renderSubs = this._topicSubs["rendered"];

    if (renderSubs) {
        SceneJS_nodeEventsModule.preVisitNode(this);
    }

    var child;

    for (var i = 0, len = this.nodes.length; i < len; i++) {

        child = this.nodes[i];

        child.branchDirty = child.branchDirty || this.branchDirty; // Compile subnodes if scene branch dirty

        if (child.dirty || child.branchDirty || this._engine.sceneDirty) {  // Compile nodes that are flagged dirty

            child._compile();

            child.dirty = false;
            child.branchDirty = false;
        }
    }

    if (renderSubs) {
        SceneJS_nodeEventsModule.postVisitNode(this);
    }
};


/**
 * Destroys this node. It is marked for destruction; when the next scene traversal begins (or the current one ends)
 * it will be destroyed and removed from it's parent.
 */
SceneJS.Node.prototype.destroy = function () {

    if (!this.destroyed) {

        if (this.parent) {

            /* Remove from parent's child node list
             */
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.parent.nodes[i].id === this.id) {
                    this.parent.nodes.splice(i, 1);
                    break;
                }
            }
        }

        // Remove publication
        this._engine.scene.unpublish("nodes/" + this.id);

        /* Recusrsively destroy child nodes without
         * bothering to remove them from their parents
         */
        this._destroyTree();

        /* Need object list recompilation on display
         */
        this._engine.display.objectListDirty = true;
    }

    return this;
};

SceneJS.Node.prototype._destroyTree = function () {

    this.destroyed = true;

    this._engine.destroyNode(this); // Release node object

    for (var i = 0, len = this.nodes.length; i < len; i++) {
        this.nodes[i]._destroyTree();
    }
};

/**
 * Performs the actual destruction of this node, calling the node's optional template destroy method
 */
SceneJS.Node.prototype._doDestroy = function () {

    if (this._destroy) {  // Call destruction handler for each node subclass
        this._destroy();
    }

    return this;
};