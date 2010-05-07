/**
 @class The basic scene node type, providing the ability to connect nodes into parent-child relationships to form scene graphs.
 @constructor
 Create a new SceneJS.node
 @param {SceneJS.node, ...} arguments Zero or more child nodes
 */
SceneJS.Node = function() {
    this._nodeType = "node";
    this._children = [];
    this._fixedParams = true;
    this._parent = null;

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

    /* Configure from variable args
     */
    if (arguments.length > 0) {
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg._render) {                      // arg is node
                this._children.push(arg);
            } else if (i == 0) {                    // arg is config
                if (arg instanceof Function) {      // arg is config function
                    this._getParams = arg;
                    this._fixedParams = false;
                } else {
                    var config = arg;               // arg is config object
                    this._fixedParams = true;
                    for (var key in arg) {
                        if (arg.hasOwnProperty(key)) {
                            if (this._fixedParams && arg[key] instanceof Function) {
                                this._fixedParams = false;
                            }
                        }
                    }
                    this._getParams = function() {  // Wrap with function to return config object
                        return config;
                    };
                }
            } else {
                SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException
                        ("Invalid node parameters - config should be first, IE. node(config, node, node,...)"));
            }
        }
        if (!this._getParams) {
            this._getParams = function() {
                return {
                };
            };
        }
    } else {
        if (!this._getParams) {
            this._getParams = function() {
                return {};
            };
        }
    }
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
SceneJS.Node.prototype._renderNodes = function(traversalContext, data) {
    var child;
    var len = this._children.length;
    if (len) {
        for (var i = 0; i < len; i++) {
            child = this._children[i];
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
    this._renderNodes(traversalContext, data);
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

///** Sets child nodes, removing those already present
// * @param {Array} children Array of child nodes
// * @return this
// */
//SceneJS.Node.prototype.setNodes = function(children) {
//    throw "SceneJS.node.setNodes not implemented yet";
//    return this;
//};

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
