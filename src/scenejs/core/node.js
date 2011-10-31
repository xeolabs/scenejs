/**
 * @class The basic scene node type
 */
SceneJS._Node = function(cfg, scene) {

    /* Public properties are stored on the _attr map
     */
    this.attr = {};
    this.attr.type = "node";
    this.attr.sid = null;
    this.attr.data = {};

    if (cfg) {
        this.attr.id = cfg.id;
        this.attr.type = cfg.type || "node";
        this.attr.data = cfg.data;
        this.attr.enabled = cfg.enabled === false ? false : true;
        this.attr.sid = cfg.sid;
        this.attr.info = cfg.info;
        this.scene = scene || this;
    }


    /* Child nodes
     */
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.numListeners = 0; // Useful for quick check whether node observes any events

    /* When compiled, a node increments this each time it discovers that it can cache more state, so that it
     * knows not to recompute that state when next compiled. Since internal state is usually dependent on the
     * states of higher nodes, this is reset whenever the node is attached to a new parent.
     */
    this._compileMemoLevel = 0

    /* Deregister default ID
     */
    if (this.attr.id) {
        //   SceneJS_sceneNodeMaps.removeItem(this.attr.id);
    }

    /* Register again by whatever ID we now have
     */
    if (this.scene && this.scene.nodeMap) {
        if (this.attr.id) {
            this.scene.nodeMap.addItem(this.attr.id, this);
        } else {
            this.attr.id = this.scene.nodeMap.addItem(this);
        }
    }

    if (cfg) {
        this._createCore(cfg.coreId || cfg.resource);
        this.setTags(cfg.tags || {});
        if (this._init) {
            this._init(cfg);
        }
    }
};

SceneJS._Node.prototype.constructor = SceneJS._Node;

SceneJS._Node.prototype._cores = {};

SceneJS._Node.prototype._createCore = function(coreId) {
    var sceneId = this.scene.attr.id;
    var sceneCores = this._cores[sceneId];
    if (!sceneCores) {
        sceneCores = this._cores[sceneId] = {};
    }
    var nodeCores = sceneCores[this.attr.type];
    if (!nodeCores) {
        nodeCores = sceneCores[this.attr.type] = {};
    }
    if (coreId) {

        /* Attempt to reuse a core
         */
        this.core = nodeCores[coreId];
        if (this.core) {
            this.core._nodeCount++;
        }
    } else {
        coreId = SceneJS._createUUID();
    }
    if (!this.core) {
        this.core = nodeCores[coreId] = {
            _coreId: coreId,
            _nodeCount : 1
        };
    }
//    this.state = new SceneJS_State({
//        core: this.core
//    });
    return this.core;
};

/**
 * Returns the ID of this node's core
 */
SceneJS._Node.prototype.getCoreId = function() {
    return this.core._coreId;
};

/**
 * Backwards compatibility
 */
SceneJS._Node.prototype.getResource = SceneJS._Node.prototype.getCoreId;


SceneJS._Node.prototype._tags = {};

SceneJS._Node.prototype.setTags = function(tags) {

};

/**
 * Dumps anything that was memoized on this node to reduce recompilation work
 */
SceneJS._Node.prototype._resetCompilationMemos = function() {
    this._compileMemoLevel = 0;
};

/**
 * Same as _resetCompilationMemos, also called on sub-nodes
 */
SceneJS._Node.prototype._resetTreeCompilationMemos = function() {
    this._resetCompilationMemos();
    for (var i = 0; i < this.children.length; i++) {
        this.children[i]._resetTreeCompilationMemos();
    }
};

SceneJS._Node.prototype._flagDirty = function() {
    this._compileMemoLevel = 0;
    //    if (this.attr._childStates && this.attr._dirty) {
    //        this._flagDirtyState(this.attr);
    //    }
};

//SceneJS._Node.prototype._flagDirtyState = function(attr) {
//    attr._dirty = true;
//    if (attr._childStates) {
//        for (var i = 0, len = attr._childStates.length; i < len; i++) {
//            if (!attr._childStates[i]._dirty) {
//                this._flagDirtyState(attr._childStates[i]);
//            }
//        }
//    }
//};

/** @private */
SceneJS._Node.prototype._compile = function() {
    this._compileNodes();
};

/** @private
 *
 * Recursively renders a node's child list.
 */
SceneJS._Node.prototype._compileNodes = function() { // Selected children - useful for Selector node

    if (this.listeners["rendered"]) {
        SceneJS_nodeEventsModule.preVisitNode(this);
    }

    var children = this.children;  // Set of child nodes we'll be rendering
    var numChildren = children.length;
    var child;
    var i;

    if (numChildren > 0) {
        for (i = 0; i < numChildren; i++) {
            child = children[i];

            if (SceneJS_compileModule.preVisitNode(child)) {
                child._compileWithEvents();
            }
            SceneJS_compileModule.postVisitNode(child);
        }
    }
    
    if (this.listeners["rendered"]) {
        SceneJS_nodeEventsModule.postVisitNode(this);
    }
};


/**
 * Wraps _compile to fire built-in events either side of rendering.
 * @private */
SceneJS._Node.prototype._compileWithEvents = function() {

    /* As scene is traversed, SceneJS_loadStatusModule will track the counts
     * of nodes that are still initialising
     *
     * If we are listening to "loading-status" events on this node, then we'll
     * get a snapshot of those stats, then report the difference from that
     * via the event once we have rendered this node.
     */
    var loadStatusSnapshot;
    if (this.listeners["loading-status"]) {
        loadStatusSnapshot = SceneJS_loadStatusModule.getStatusSnapshot();
    }
    this._compile();
    if (this.listeners["loading-status"]) { // Report diff of loading stats that occurred while rending this tree
        this._fireEvent("loading-status", SceneJS_loadStatusModule.diffStatus(loadStatusSnapshot));
    }

};

/**
 * Returns the SceneJS-assigned ID of the node.
 * @returns {string} Node's ID
 */
SceneJS._Node.prototype.getID = function() {
    return this.attr.id;
};

/**
 * Alias for {@link #getID()} to assist resolution of the ID by JSON query API
 * @returns {string} Node's ID
 */
SceneJS._Node.prototype.getId = SceneJS._Node.prototype.getID;

/**
 * Returns the type ID of the node. For the Node base class, it is "node",
 * which is overriden in sub-classes.
 * @returns {string} Type ID
 */
SceneJS._Node.prototype.getType = function() {
    return this.attr.type;
};

/**
 * Returns the data object attached to this node.
 * @returns {Object} data object
 */
SceneJS._Node.prototype.getData = function() {
    return this.attr.data;
};

/**
 * Sets a data object on this node.
 * @param {Object} data Data object
 */
SceneJS._Node.prototype.setData = function(data) {
    this.attr.data = data;
    return this;
};

/**
 * Returns the node's optional subidentifier, which must be unique within the scope
 * of the parent node.
 * @returns {string} Node SID
 *  @deprecated
 */
SceneJS._Node.prototype.getSID = function() {
    return this.attr.sid;
};

/** Returns the SceneJS.Scene to which this node belongs.
 * Returns node if this is a SceneJS_scene.
 * @returns {SceneJS.Scene} Scene node
 */
SceneJS._Node.prototype.getScene = function() {
    return this.scene;
};

/**
 * Returns the number of child nodes
 * @returns {int} Number of child nodes
 */
SceneJS._Node.prototype.getNumNodes = function() {
    return this.children.length;
};

/** Returns child nodes
 * @returns {Array} Child nodes
 */
SceneJS._Node.prototype.getNodes = function() {
    var list = new Array(this.children.length);
    var len = this.children.length;
    for (var i = 0; i < len; i++) {
        list[i] = this.children[i];
    }
    return list;
};

/** Returns child node at given index. Returns null if no node at that index.
 * @param {Number} index The child index
 * @returns {Node} Child node, or null if not found
 */
SceneJS._Node.prototype.getNodeAt = function(index) {
    if (index < 0 || index >= this.children.length) {
        return null;
    }
    return this.children[index];
};

/** Returns first child node. Returns null if no child nodes.
 * @returns {Node} First child node, or null if not found
 */
SceneJS._Node.prototype.getFirstNode = function() {
    if (this.children.length == 0) {
        return null;
    }
    return this.children[0];
};

/** Returns last child node. Returns null if no child nodes.
 * @returns {Node} Last child node, or null if not found
 */
SceneJS._Node.prototype.getLastNode = function() {
    if (this.children.length == 0) {
        return null;
    }
    return this.children[this.children.length - 1];
};

/** Returns child node with the given ID.
 * Returns null if no such child node found.
 * @param {String} sid The child's SID
 * @returns {Node} Child node, or null if not found
 */
SceneJS._Node.prototype.getNode = function(id) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].attr.id == id) {
            return this.children[i];
        }
    }
    return null;
};

/** Disconnects the child node at the given index from its parent node
 * @param {int} index Child node index
 * @returns {Node} The disconnected child node if located, else null
 */
SceneJS._Node.prototype.disconnectNodeAt = function(index) {
    var r = this.children.splice(index, 1);
    this._resetCompilationMemos();
    if (r.length > 0) {
        r[0].parent = null;
        return r[0];
    } else {
        return null;
    }
};

/** Disconnects the child node from its parent, given as a node object
 * @param {String | Node} id The target child node, or its ID
 * @returns {Node} The removed child node if located
 */
SceneJS._Node.prototype.disconnect = function() {
    if (this.parent) {
        for (var i = 0; i < this.parent.children.length; i++) {
            if (this.parent.children[i] === this) {
                return this.parent.disconnectNodeAt(i);
            }
        }
    }
};

/** Removes the child node at the given index
 * @param {int} index Child node index
 */
SceneJS._Node.prototype.removeNodeAt = function(index) {
    var child = this.disconnectNodeAt(index);
    if (child) {
        child.destroy();
    }
};

/** Removes the child node, given as either a node object or an ID string.
 * @param {String | Node} id The target child node, or its ID
 * @returns {Node} The removed child node if located
 */
SceneJS._Node.prototype.removeNode = function(node) {
    if (!node) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#removeNode - node argument undefined");
    }
    if (!node._compile) {
        if (typeof node == "string") {
            var gotNode = this.scene.nodeMap.items[node];
            if (!gotNode) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_NOT_FOUND,
                        "Node#removeNode - node not found anywhere: '" + node + "'");
            }
            node = gotNode;
        }
    }
    if (node._compile) { //  instance of node
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] === node) {
                //this._resetCompilationMemos(); (removeNodeAt already does this)
                return this.removeNodeAt(i);
            }
        }
    }
    throw SceneJS_errorModule.fatalError(
            SceneJS.errors.NODE_NOT_FOUND,
            "Node#removeNode - child node not found: " + (node._compile ? ": " + node.attr.id : node));
};

/** Disconnects all child nodes from their parent node and returns them in an array.
 * @returns {Array[Node]} The disconnected child nodes
 */
SceneJS._Node.prototype.disconnectNodes = function() {
    for (var i = 0; i < this.children.length; i++) {  // Unlink children from this
        this.children[i].parent = null;
    }
    var children = this.children;
    this.children = [];
    this._resetCompilationMemos();
    return children;
};

/** Removes all child nodes and returns them in an array.
 * @returns {Array[Node]} The removed child nodes
 */
SceneJS._Node.prototype.removeNodes = function() {
    var children = this.disconnectNodes();
    for (var i = 0; i < children.length; i++) {
        children[i].destroy();
    }

};

/** Destroys node and moves children up to parent, inserting them where this node resided.
 * @returns {Node} The parent
 */
SceneJS._Node.prototype.splice = function() {
    if (this.parent == null) {
        return null;
    }
    var parent = this.parent;
    var children = this.disconnectNodes();
    for (var i = 0, len = children.length; i < len; i++) {  // Link this node's children to new parent
        children[i].parent = this.parent;
    }
    for (var i = 0, len = parent.children.length; i < len; i++) { // Replace node on parent's children with this node's children
        if (parent.children[i] === this) {
            parent.children.splice.apply(parent.children, [i, 1].concat(children));
            this.parent = null;
            this.destroy();
            parent._resetTreeCompilationMemos();
            SceneJS_compileModule.nodeUpdated(parent);
            return parent;
        }
    }
};

/** Appends multiple child nodes
 * @param {Array[Node]} nodes Array of nodes
 * @return {Node} This node
 */
SceneJS._Node.prototype.addNodes = function(nodes) {
    if (!nodes) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNodes - nodes argument is undefined");
    }
    for (var i = nodes.length - 1; i >= 0; i--) {
        this.addNode(nodes[i]);
    }
    this._resetCompilationMemos();
    return this;
};

/** Appends a child node
 * @param {Node} node Child node
 * @return {Node} The child node
 */
SceneJS._Node.prototype.addNode = function(node) {
    if (!node) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is undefined");
    }
    if (!node._compile) {
        if (typeof node == "string") {
            var gotNode = this.scene.nodeMap.items[node];
            if (!gotNode) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "Node#addNode - node not found: '" + node + "'");
            }
            node = gotNode;
        } else {
            node = SceneJS._parseNodeJSON(node, this.scene);
        }
    }
    if (!node._compile) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is not a Node or subclass!");
    }
    if (node.parent != null) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is still attached to another parent!");
    }
    this.children.push(node);
    node.parent = this;
    node._resetTreeCompilationMemos();
    return node;
};

/** Inserts a subgraph into child nodes
 * @param {Node} node Child node
 * @param {int} i Index for new child node
 * @return {Node} The child node
 */
SceneJS._Node.prototype.insertNode = function(node, i) {
    if (!node) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#insertNode - node argument is undefined");
    }
    if (!node._compile) {
        node = SceneJS._parseNodeJSON(node, this.scene);
    }
    if (!node._compile) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#insertNode - node argument is not a Node or subclass!");
    }
    if (node.parent != null) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#insertNode - node argument is still attached to another parent!");
    }

    if (i == undefined || i == null) {

        /* Insert node above children when no index given
         */
        var children = this.disconnectNodes();

        /* Move children to right-most leaf of inserted graph
         */
        var leaf = node;
        while (leaf.getNumNodes() > 0) {
            leaf = leaf.getLastNode();
        }
        leaf.addNodes(children);
        this.addNode(node);

    } else if (i < 0) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#insertNode - node index out of range: -1");

    } else if (i >= this.children.length) {
        this.children.push(node);

    } else {
        this.children.splice(i, 0, node);
    }
    node.parent = this;
    node._resetTreeCompilationMemos();
    return node;
};

/** Calls the given function on each node in the subgraph rooted by this node, including this node.
 * The callback takes each node as it's sole argument and traversal stops as soon as the function returns
 * true and returns the node.
 * @param {function(Node)} func The function
 */
SceneJS._Node.prototype.mapNodes = function(func) {
    if (func(this)) {
        return this;
    }
    var result;
    for (var i = 0; i < this.children.length; i++) {
        result = this.children[i].mapNodes(func);
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
SceneJS._Node.prototype.addListener = function(eventName, fn, options) {
    var list = this.listeners[eventName];
    if (!list) {
        list = [];
        this.listeners[eventName] = list;
    }
    list.push({
        eventName : eventName,
        fn: fn,
        options : options || {}
    });
    this.numListeners++;
    this._resetCompilationMemos();  // Need re-render - potentially more state changes
    return this;
};

/**
 * Destroys this node. It is marked for destruction; when the next scene traversal begins (or the current one ends)
 * it will be destroyed and removed from it's parent.
 * @return {Node} this
 */
SceneJS._Node.prototype.destroy = function() {
    if (!this._destroyed) {
        this._destroyed = true;
        this._scheduleNodeDestroy();
    }
    return this;
};

/** Schedule the destruction of this node
 */
SceneJS._Node.prototype._scheduleNodeDestroy = function() {
    this.disconnect();
    this.scene.nodeMap.removeItem(this.attr.id);
    if (this.children.length > 0) {
        var children = this.children.slice(0);      // destruction will modify this.children
        for (var i = 0; i < children.length; i++) {
            children[i]._scheduleNodeDestroy();
        }
    }
    SceneJS._destroyedNodes.push(this);
};

/**
 * Performs the actual destruction of this node, calling the node's optional template destroy method
 */
SceneJS._Node.prototype._doDestroy = function() {
    if (this._destroy) {
        this._destroy();
    }
    if (--this.core._nodeCount <= 0) {
        this._cores[this.scene.attr.id][this.attr.type][this.core._coreId] = null;
    }
    return this;
};


/**
 * Fires an event at this node, immediately calling listeners registered for the event
 * @param {String} eventName Event name
 * @param {Object} params Event parameters
 * @param {Object} options Event options
 */
SceneJS._Node.prototype._fireEvent = function(eventName, params, options) {
    var list = this.listeners[eventName];
    if (list) {
        if (!params) {
            params = {};
        }
        var event = {
            name: eventName,
            params : params,
            options: options || {}
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
 *
 * @param {String} eventName Event type that handler is registered for
 * @param {function} fn - Handler function that is registered for the event
 * @return {function} The handler, or null if not registered
 */
SceneJS._Node.prototype.removeListener = function(eventName, fn) {
    var list = this.listeners[eventName];
    if (!list) {
        return null;
    }
    for (var i = 0; i < list.length; i++) {
        if (list[i].fn == fn) {
            list.splice(i, 1);
            return fn;
        }
    }
    this.numListeners--;
    return null;
};

/**
 * Returns true if this node has any listeners for the given event .
 *
 * @param {String} eventName Event type
 * @return {boolean} True if listener present
 */
SceneJS._Node.prototype.hasListener = function(eventName) {
    return this.listeners[eventName];
};

/**
 * Returns true if this node has any listeners at all.
 *
 * @return {boolean} True if any listener present
 */
SceneJS._Node.prototype.hasListeners = function() {
    return (this.numListeners > 0);
};

/** Removes all listeners registered on this node.
 * @return {Node} this
 */
SceneJS._Node.prototype.removeListeners = function() {
    this.listeners = {};
    this.numListeners = 0;
    return this;
};

/** Returns the parent node
 * @return {Node} The parent node
 */
SceneJS._Node.prototype.getParent = function() {
    return this.parent;
};

/** Returns either all child or all sub-nodes of the given type, depending on whether search is recursive or not.
 * @param {string} type Node type
 * @param {boolean} [recursive=false] When true, will return all matching nodes in subgraph, otherwise returns just children (default)
 * @return {SceneJS.node[]} Array of matching nodes
 */
SceneJS._Node.prototype.findNodesByType = function(type, recursive) {
    return this._findNodesByType(type, [], recursive);
};

/** @private */
SceneJS._Node.prototype._findNodesByType = function(type, list, recursive) {
    for (var i = 0; i < this.children; i++) {
        var node = this.children[i];
        if (node.type == type) {
            list.add(node);
        }
    }
    if (recursive) {
        for (var i = 0; i < this.children; i++) {
            this.children[i]._findNodesByType(type, list, recursive);
        }
    }
    return list;
};

/**
 * Returns an object containing the attributes that were given when creating the node. Obviously, the map will have
 * the current values, plus any attributes that were later added through set/add methods on the node
 *
 */
SceneJS._Node.prototype.getJSON = function() {
    return this.attr;
};

