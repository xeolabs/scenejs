SceneJS.withNode = function(node) {
    return new SceneJS._WithNode(node);
};

/** Selects a scene graph node by its ID and provides a set of methods to modify and observe it.
 * @returns {Object} Handle to node
 */

SceneJS._WithNode = function(node) {
    if (!node) {
        throw "withNode param 'node' is null or undefined";
    }
    this._targetNode = node._render ? node : SceneJS._nodeIDMap[node];
    if (!this._targetNode) {
        throw "withNode node not found: '" + node + "'";
    }
};


/** Selects the parent of the selected node
 */
SceneJS._WithNode.prototype.parent = function() {
    var parent = this._targetNode.getParent();
    if (!parent) {
        return null;
    }
    return new SceneJS._WithNode(parent);
};

/** Selects a child node matching given ID or index
 * @param {Number|String} node Child node index or ID
 */
SceneJS._WithNode.prototype.node = function(node) {
    if (node === null || typeof(node) === "undefined") {
        throw "node param 'node' is null or undefined";
    }
    var type = typeof node;
    var nodeGot;
    if (type == "number") {
        nodeGot = this._targetNode.getNodeAt(node);
    } else if (type == "string") {
        nodeGot = this._targetNode.getNode(node);
    } else {
        throw "node param 'node' should be either an index number or an ID string";
    }
    if (!nodeGot) {
        throw "node not found: '" + node + "'";
    }
    return new SceneJS._WithNode(nodeGot);
};

/** Returns true if a child node matching given ID or index existis on the selected node
 * @param {Number|String} node Child node index or ID
 */
SceneJS._WithNode.prototype.hasNode = function(node) {
    if (!node === null || typeof(node) === "undefined") {
        throw "hasNode param 'node' is null or undefined";
    }
    var type = typeof node;
    var nodeGot;
    if (type == "number") {
        nodeGot = this._targetNode.getNodeAt(node);
    } else if (type == "string") {
        nodeGot = this._targetNode.getNode(node);
    } else {
        throw "hasNode param 'node' should be either an index number or an ID string";
    }
    return (nodeGot != undefined && nodeGot != null);
};

/**
 * Iterates over parent nodes on the path from the selected node to the root, executing a function
 * for each.
 * If the function returns true at any node, then traversal stops and a selector is
 * returned for that node.
 * @param {Function(node, index)} fn Function to execute on each instance node
 * @return {Object} Selector for selected node, if any
 */
SceneJS._WithNode.prototype.eachParent = function(fn) {
    if (!fn) {
        throw "eachParent param 'fn' is null or undefined";
    }
    var selector;
    var count = 0;
    var node = this._targetNode._parent;
    while (node._parent) {
        selector = new SceneJS._WithNode(node._parent);
        if (fn.call(selector, count++) === true) {
            return selector;
        }
        node = node._parent;
    }
    return undefined;
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
SceneJS._WithNode.prototype.eachNode = function(fn, options) {
    if (!fn) {
        throw "eachNode param 'fn' is null or undefined";
    }
    if (typeof fn != "function") {
        throw "eachNode param 'fn' should be a function";
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
        stoppedNode = this._iterateEachNode(fn, this._targetNode, count);
    } else if (options.depthFirst) {
        stoppedNode = this._iterateEachNodeDepthFirst(fn, this._targetNode, count, false); // Not below root yet
    } else {
        // TODO: breadth-first
    }
    if (stoppedNode) {
        return stoppedNode;
    }
    return undefined; // IDE happy now
};

SceneJS._WithNode.prototype.numNodes = function() {
    return this._targetNode._children.length;
};

/**
 * Iterates over instance nodes that target the selected node, executing a function
 * for each.
 * If the function returns true at any node, then traversal stops and a selector is
 * returned for that node.
 * @param {Function(index, node)} fn Function to execute on each instance node
 * @return {Object} Selector for selected node, if any
 */
SceneJS._WithNode.prototype.eachInstance = function(fn) {
    if (!fn) {
        throw "eachInstance param 'fn' is null or undefined";
    }
    if (typeof fn != "function") {
        throw "eachInstance param 'fn' should be a function";
    }
    var nodeInstances = SceneJS._nodeInstanceMap[this._targetNode._id];
    if (nodeInstances) {
        var instances = nodeInstances.instances;
        var count = 0;
        var selector;
        for (var instanceNodeId in instances) {
            if (instances.hasOwnProperty(instanceNodeId)) {
                selector = new SceneJS._WithNode(instanceNodeId);
                if (fn.call(selector, count++) === true) {
                    return selector;
                }
            }
        }
    }
    return undefined;
};

SceneJS._WithNode.prototype.numInstances = function() {
    var instances = SceneJS._nodeInstanceMap[this._targetNode._id];
    return instances ? instances.numInstances : 0;
};

/** Sets an attribute of the selected node
 */
SceneJS._WithNode.prototype.set = function(attr, value) {
    if (!attr) {
        throw "set param 'attr' null or undefined";
    }
    if (typeof attr == "string") {
        this._callNodeMethod("set", attr, value, this._targetNode);
    } else {
        this._callNodeMethods("set", attr, this._targetNode);
    }
    return this;
};

/** Adds an attribute to the selected node
 */
SceneJS._WithNode.prototype.add = function(attr, value) {
    if (!attr) {
        throw "add param 'attr' null or undefined";
    }
    if (typeof attr == "string") {
        this._callNodeMethod("add", attr, value, this._targetNode);
    } else {
        this._callNodeMethods("add", attr, this._targetNode);
    }
    return this;
};

/** Increments an attribute to the selected node
 */
SceneJS._WithNode.prototype.inc = function(attr, value) {
    if (!attr) {
        throw "inc param 'attr' null or undefined";
    }
    if (typeof attr == "string") {
        this._callNodeMethod("inc", attr, value, this._targetNode);
    } else {
        this._callNodeMethods("inc", attr, this._targetNode);
    }
    return this;
};

/** Inserts an attribute or child node into the selected node
 */
SceneJS._WithNode.prototype.insert = function(attr, value) {
    if (!attr) {
        throw "insert param 'attr' null or undefined";
    }
    if (typeof attr == "string") {
        this._callNodeMethod("insert", attr, value, this._targetNode);
    } else {
        this._callNodeMethods("insert", attr, this._targetNode);
    }
    return this;
};

/** Removes an attribute from the selected node
 */
SceneJS._WithNode.prototype.remove = function(attr, value) {
    if (!attr) {
        throw "remove param 'attr' null or undefined";
    }
    if (typeof attr == "string") {
        this._callNodeMethod("remove", attr, value, this._targetNode);
    } else {
        this._callNodeMethods("remove", attr, this._targetNode);
    }
    return this;
};

/** Returns the value of an attribute of the selected node
 */
SceneJS._WithNode.prototype.get = function(attr) {
    if (!attr) {
        return this._targetNode.getJson();
    }
    var funcName = "get" + attr.substr(0, 1).toUpperCase() + attr.substr(1);
    var func = this._targetNode[funcName];
    if (!func) {
        throw "Attribute '" + attr + "' not found on node '" + this._targetNode.getID() + "'";
    }
    return func.call(this._targetNode);
};

/** 
 * @return true if node has attribute, false otherwise
 */
SceneJS._WithNode.prototype.hasAttribute = function(attr) {
    if (!attr) {
        return false;
    }
    var funcName = "get" + attr.substr(0, 1).toUpperCase() + attr.substr(1);
    var func = this._targetNode[funcName];
    if (!func) {
        return false;
    }
    return true;
};

/** Binds a listener to an event on the selected node
 *
 * @param {String} name Event name
 * @param {Function} handler Event handler
 */
SceneJS._WithNode.prototype.bind = function(name, handler) {
    if (!name) {
        throw "bind param 'name' null or undefined";
    }
    if (typeof name != "string") {
        throw "bind param 'name' should be a string";
    }
    if (!handler) {
        throw "bind param 'handler' null or undefined";
    }
    if (typeof handler != "function") {
        throw "bind param 'handler' should be a function";
    } else {
        this._targetNode.addListener(name, handler, { scope: this });
    }
    //else {
    //        var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
    //        if (!handler.target) {
    //            handler.target = this._targetNode.getID();
    //        }
    //        this._targetNode.addListener(
    //                name,
    //                function(params) {
    //                    commandService.executeCommand(handler);
    //                }, { scope: this });
    //    }
    return this;
};

/**
 * Performs pick on the selected scene node, which must be a scene.
 * @param offsetX Canvas X-coordinate
 * @param offsetY Canvas Y-coordinate
 */
SceneJS._WithNode.prototype.pick = function(offsetX, offsetY) {
    if (!offsetX) {
        throw "pick param 'offsetX' null or undefined";
    }
    if (typeof offsetX != "number") {
        throw "pick param 'offsetX' should be a number";
    }
    if (!offsetY) {
        throw "pick param 'offsetY' null or undefined";
    }
    if (typeof offsetY != "number") {
        throw "pick param 'offsetY' should be a number";
    }
    if (this._targetNode.getType() != "scene") {
        throw "pick attempted on node that is not a \"scene\" type: '" + this._targetNode.getID() + "'";
    }
    this._targetNode.pick(offsetX, offsetY);
    return this;
};

/**
 * Renders the selected scene node, which must be a scene.
 */
SceneJS._WithNode.prototype.render = function () {
    if (this._targetNode.getType() != "scene") {
        throw "render attempted on node that is not a \"scene\" type: '" + this._targetNode.getID() + "'";
    }
    this._targetNode.render();
    return this;
};

/**
 * Starts the selected scene node, which must be a scene.
 */
SceneJS._WithNode.prototype.start = function (cfg) {
    if (this._targetNode.getType() != "scene") {
        throw "start attempted on node that is not a \"scene\" type: '" + this._targetNode.getID() + "'";
    }
    cfg = cfg || {};
    if (cfg.idleFunc) {    // Wrap idleFunc to call on selector as scope
        var fn = cfg.idleFunc;
        cfg.idleFunc = function() {
            fn(this);
        };
    }
    this._targetNode.start(cfg);
    return this;
};

/**
 * Stops the selected scene node, which must be a scene.
 */
SceneJS._WithNode.prototype.stop = function () {
    if (this._targetNode.getType() != "scene") {
        throw "stop attempted on node that is not a \"scene\" '" + this._targetNode.getID() + "'";
    }
    this._targetNode.stop();
    return this;
};

/**
 * Destroys the selected scene node, which must be a scene.
 */
SceneJS._WithNode.prototype.destroy = function() {
    if (this._targetNode.getType() != "scene") {
        throw "destroy attempted on node that is not a \"scene\" type: '" + this._targetNode.getID() + "'";
    }
    this._targetNode.destroy();
    return this;
};

/** Allows us to get or set data of any type on the scene node
 */
SceneJS._WithNode.prototype.data = function(data, value) {
    if (!data) {
        return this._targetNode._data;
    }
    this._targetNode._data = this._targetNode._data || {};
    if (typeof data == "string") {
        if (value != undefined) {
            this._targetNode._data[data] = value;
            return this;
        } else {
            return this._targetNode._data[data];
        }
    } else {
        if (value != undefined) {
            this._targetNode._data = value;
            return this;
        } else {
            return this._targetNode._data;
        }
    }
};

SceneJS._WithNode.prototype._iterateEachNode = function(fn, node, count) {
    var len = node._children.length;
    var selector;
    for (var i = 0; i < len; i++) {
        selector = new SceneJS._WithNode(node._children[i]);
        if (fn.call(selector, count++) == true) {
            return selector;
        }
    }
    return undefined;
};

SceneJS._WithNode.prototype._iterateEachNodeDepthFirst = function(fn, node, count, belowRoot) {
    var selector;
    if (belowRoot) {

        /* Visit this node - if we are below root, because entry point visits the root
         */
        selector = new SceneJS._WithNode(node);
        if (fn.call(selector, count++) == true) {
            return selector;
        }
    }
    belowRoot = true;

    /* Iterate children
     */
    var len = node._children.length;
    for (var i = 0; i < len; i++) {
        selector = this._iterateEachNodeDepthFirst(fn, node._children[i], count, belowRoot);
        if (selector) {
            return selector;
        }
    }
    return undefined;

};

SceneJS._WithNode.prototype._callNodeMethod = function(prefix, attr, value, targetNode) {
    var funcName = prefix + attr.substr(0, 1).toUpperCase() + attr.substr(1);
    var func = targetNode[funcName];
    if (!func) {
        throw "Attribute '" + attr + "' not found on node '" + targetNode.getID() + "' for " + prefix;
    }
    func.call(targetNode, value);

    /* TODO: optimise - dont fire unless listener exists
     */
    var params = {};
    params[attr] = value;

    SceneJS._needFrame = true;  // Flag another scene render pass needed

    /* TODO: event should be queued and consumed to avoid many of these events accumulating
     */
    targetNode._fireEvent("updated", params);
    //   SceneJS._eventModule.fireEvent(SceneJS._eventModule.NODE_UPDATED, { nodeId : node.getID() });
};

SceneJS._WithNode.prototype._callNodeMethods = function(prefix, attr, targetNode) {
    for (var key in attr) {
        if (attr.hasOwnProperty(key)) {
            key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
            var funcName = prefix + key.substr(0, 1).toUpperCase() + key.substr(1);
            var func = targetNode[funcName];
            if (!func) {
                throw "Attribute '" + key + "' not found on node '" + targetNode.getID() + "' for " + prefix;
            }
            func.call(targetNode, attr[key]);

            SceneJS._needFrame = true;  // Flag another scene render pass needed
        }
    }

    /* Raise flag so that all Scenes currently
     * running rendering loops will render another frame.
     */
    SceneJS._needFrame = true;

    /* TODO: optimise - dont fire unless listener exists
     */
    /* TODO: event should be queued and consumed to avoid many of these events accumulating
     */
    targetNode._fireEvent("updated", { attr: attr });
};


