(function() {

    var NodeSelector = function(node) {
        this._targetNode = node;
        this._methods = {
        };
    };

    SceneJS._selectNode = function(node) {
        if (!node.__selector) {
            node.__selector = new NodeSelector(node);
        }
        return node.__selector;
    };

    /** Selects the parent of the selected node
     */
    NodeSelector.prototype.parent = function() {
        var parent = this._targetNode.parent;
        if (!parent) {
            return null;
        }
        return SceneJS._selectNode(parent);
    };

    /** Selects a child node matching given ID or index
     * @param {Number|String} node Child node index or ID
     */
    NodeSelector.prototype.node = function(node) {
        if (node === null || node === undefined) {
            throw SceneJS_errorModule.fatalError("node param 'node' is null or undefined");
        }
        var type = typeof node;
        var nodeGot;
        if (type == "number") {
            nodeGot = this._targetNode.getNodeAt(node);
        } else if (type == "string") {
            nodeGot = this._targetNode.getNode(node);
        } else {
            SceneJS_errorModule.fatalError("node param 'node' should be either an index number or an ID string");
        }
        if (!nodeGot) {
            throw "node not found: '" + node + "'";
        }
        return SceneJS._selectNode(nodeGot);
    };

    NodeSelector.prototype.findNode = function (nodeId) {
        if (this._targetNode.attr.type != "scene") {
            SceneJS_errorModule.fatalError("findNode attempted on node that is not a \"scene\" type: '" + this._targetNode.attr.id + "'");
        }
        return this._targetNode.findNode(nodeId);
    };

    /** Returns the scene to which the node belongs
     */
    NodeSelector.prototype.scene = function() {
        return SceneJS._selectNode(this._targetNode.scene);
    };

    /** Returns true if a child node matching given ID or index existis on the selected node
     * @param {Number|String} node Child node index or ID
     */
    NodeSelector.prototype.hasNode = function(node) {
        if (!node === null || typeof(node) === "undefined") {
            throw SceneJS_errorModule.fatalError("hasNode param 'node' is null or undefined");
        }
        var type = typeof node;
        var nodeGot;
        if (type == "number") {
            nodeGot = this._targetNode.getNodeAt(node);
        } else if (type == "string") {
            nodeGot = this._targetNode.getNode(node);
        } else {
            throw SceneJS_errorModule.fatalError("hasNode param 'node' should be either an index number or an ID string");
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
    NodeSelector.prototype.eachParent = function(fn) {
        if (!fn) {
            throw SceneJS_errorModule.fatalError("eachParent param 'fn' is null or undefined");
        }
        var selector;
        var count = 0;
        var node = this._targetNode;
        while (node.parent) {
            selector = SceneJS._selectNode(node.parent);
            if (fn.call(selector, count++) === true) {
                return selector;
            }
            node = node.parent;
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
    NodeSelector.prototype.eachNode = function(fn, options) {
        if (!fn) {
            throw SceneJS_errorModule.fatalError("eachNode param 'fn' is null or undefined");
        }
        if (typeof fn != "function") {
            throw SceneJS_errorModule.fatalError("eachNode param 'fn' should be a function");
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

    NodeSelector.prototype.numNodes = function() {
        return this._targetNode.children.length;
    };   

    /** Sets an attribute of the selected node
     */
    NodeSelector.prototype.set = function(attr, value) {
        if (!attr) {
            throw SceneJS_errorModule.fatalError("set param 'attr' null or undefined");
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
    NodeSelector.prototype.add = function(attr, value) {
        if (!attr) {
            throw SceneJS_errorModule.fatalError("add param 'attr' null or undefined");
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
    NodeSelector.prototype.inc = function(attr, value) {
        if (!attr) {
            throw SceneJS_errorModule.fatalError("inc param 'attr' null or undefined");
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
    NodeSelector.prototype.insert = function(attr, value) {
        if (!attr) {
            throw SceneJS_errorModule.fatalError("insert param 'attr' null or undefined");
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
    NodeSelector.prototype.remove = function(attr, value) {
        if (!attr) {
            throw SceneJS_errorModule.fatalError("remove param 'attr' null or undefined");
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
    NodeSelector.prototype.get = function(attr) {
        if (!attr) {
            return this._targetNode.getJSON();
        }
        var funcName = "get" + attr.substr(0, 1).toUpperCase() + attr.substr(1);
        var func = this._targetNode[funcName];
        if (!func) {
            throw SceneJS_errorModule.fatalError("Attribute '" + attr + "' not found on node '" + this._targetNode.attr.id + "'");
        }
        return func.call(this._targetNode);
    };

    /** Binds a listener to an event on the selected node
     *
     * @param {String} name Event name
     * @param {Function} handler Event handler
     */
    NodeSelector.prototype.bind = function(name, handler) {
        if (!name) {
            throw SceneJS_errorModule.fatalError("bind param 'name' null or undefined");
        }
        if (typeof name != "string") {
            throw SceneJS_errorModule.fatalError("bind param 'name' should be a string");
        }
        if (!handler) {
            throw SceneJS_errorModule.fatalError("bind param 'handler' null or undefined");
        }
        if (typeof handler != "function") {
            throw SceneJS_errorModule.fatalError("bind param 'handler' should be a function");
        } else {
            this._targetNode.addListener(name, handler, { scope: this });
            SceneJS_compileModule.nodeUpdated(this._targetNode, "bind", name);
        }
        //else {
        //        var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
        //        if (!handler.target) {
        //            handler.target = this._targetNode.attr.id;
        //        }
        //        this._targetNode.addListener(
        //                name,
        //                function(params) {
        //                    commandService.executeCommand(handler);
        //                }, { scope: this });
        //    }
        return this;
    };

    /** Unbinds a listener for an event on the selected node
     *
     * @param {String} name Event name
     * @param {Function} handler Event handler
     */
    NodeSelector.prototype.unbind = function(name, handler) {
        if (!name) {
            throw SceneJS_errorModule.fatalError("bind param 'name' null or undefined");
        }
        if (typeof name != "string") {
            throw SceneJS_errorModule.fatalError("bind param 'name' should be a string");
        }
        if (!handler) {
            throw SceneJS_errorModule.fatalError("bind param 'handler' null or undefined");
        }
        if (typeof handler != "function") {
            throw SceneJS_errorModule.fatalError("bind param 'handler' should be a function");
        } else {
            this._targetNode.removeListener(name, handler);
            // SceneJS_compileModule.nodeUpdated(this._targetNode);
            SceneJS_compileModule.nodeUpdated(this._targetNode, "unbind", name);
        }
        return this;
    };

    /**
     * Performs pick on the selected scene node, which must be a scene.
     * @param offsetX Canvas X-coordinate
     * @param offsetY Canvas Y-coordinate
     */
    NodeSelector.prototype.pick = function(offsetX, offsetY, options) {
        if (!offsetX) {
            throw SceneJS_errorModule.fatalError("pick param 'offsetX' null or undefined");
        }
        if (typeof offsetX != "number") {
            throw SceneJS_errorModule.fatalError("pick param 'offsetX' should be a number");
        }
        if (!offsetY) {
            throw SceneJS_errorModule.fatalError("pick param 'offsetY' null or undefined");
        }
        if (typeof offsetY != "number") {
            throw SceneJS_errorModule.fatalError("pick param 'offsetY' should be a number");
        }
        if (this._targetNode.attr.type != "scene") {
            throw SceneJS_errorModule.fatalError("pick attempted on node that is not a \"scene\" type: '" + this._targetNode.attr.id + "'");
        }
        this._targetNode.pick(offsetX, offsetY, options);
        return this;
    };

    /**
     * Renders the selected scene node, which must be a scene.
     */
    NodeSelector.prototype.render = function () {
        if (this._targetNode.attr.type != "scene") {
            throw SceneJS_errorModule.fatalError("render attempted on node that is not a \"scene\" type: '" + this._targetNode.attr.id + "'");
        }
        this._targetNode.render();
        return this;
    };

    /**
     * Starts the selected scene node, which must be a scene.
     */
    NodeSelector.prototype.start = function (cfg) {
        if (this._targetNode.attr.type != "scene") {
            throw SceneJS_errorModule.fatalError("start attempted on node that is not a \"scene\" type: '" + this._targetNode.attr.id + "'");
        }
        cfg = cfg || {};
        var self = this;
        if (cfg.idleFunc) {    // Wrap idleFunc to call on selector as scope
            var idleFunc = cfg.idleFunc;
            cfg.idleFunc = function(params) {
                idleFunc.call(self, params);
            };
        }
        if (cfg.sleepFunc) {    // Wrap idleFunc to call on selector as scope
            var sleepFunc = cfg.sleepFunc;
            cfg.sleepFunc = function() {
                sleepFunc.call(self);
            };
        }
        this._targetNode.start(cfg);
        return this;
    };

    /**
     * Stops the selected scene node, which must be a scene.
     */
    NodeSelector.prototype.stop = function () {
        if (this._targetNode.attr.type != "scene") {
            throw SceneJS_errorModule.fatalError("stop attempted on node that is not a \"scene\" '" + this._targetNode.attr.id + "'");
        }
        this._targetNode.stop();
        return this;
    };

    /**
     * Stops the selected scene node, which must be a scene.
     */
    NodeSelector.prototype.pause = function (doPause) {
        if (this._targetNode.attr.type != "scene") {
            throw SceneJS_errorModule.fatalError("pause attempted on node that is not a \"scene\" '" + this._targetNode.attr.id + "'");
        }
        this._targetNode.pause(doPause);
        return this;
    };

    /**
     * Splices the selected scene node - replaces itself on its parent with its child nodes
     */
    NodeSelector.prototype.splice = function() {
        this._targetNode.splice();
        return this;
    };

    /**
     * Destroys the selected scene node
     */
    NodeSelector.prototype.destroy = function() {
        this._targetNode.destroy();
        return this;
    };

    /** Allows us to get or set data of any type on the scene node.
     *  Modifying data does not trigger rendering.
     */
    NodeSelector.prototype.data = function(data, value) {
        if (!data) {
            return this._targetNode.attr.data;
        }
        this._targetNode.attr.data = this._targetNode.attr.data || {};
        if (typeof data == "string") {
            if (value != undefined) {
                this._targetNode.attr.data[data] = value;
                return this;
            } else {
                return this._targetNode.attr.data[data];
            }
        } else {
            if (value != undefined) {
                this._targetNode.attr.data = value;
                return this;
            } else {
                return this._targetNode.attr.data;
            }
        }
    };

    NodeSelector.prototype._iterateEachNode = function(fn, node, count) {
        var len = node.children.length;
        var selector;
        for (var i = 0; i < len; i++) {
            selector = SceneJS._selectNode(node.children[i]);
            if (fn.call(selector, count++) == true) {
                return selector;
            }
        }
        return undefined;
    };

    NodeSelector.prototype._iterateEachNodeDepthFirst = function(fn, node, count, belowRoot) {
        var selector;
        if (belowRoot) {

            /* Visit this node - if we are below root, because entry point visits the root
             */
            selector = SceneJS._selectNode(node);
            if (fn.call(selector, count++) == true) {
                return selector;
            }
        }
        belowRoot = true;

        /* Iterate children
         */
        var len = node.children.length;
        for (var i = 0; i < len; i++) {
            selector = this._iterateEachNodeDepthFirst(fn, node.children[i], count, belowRoot);
            if (selector) {
                return selector;
            }
        }
        return undefined;

    };

    NodeSelector.prototype._callNodeMethod = function(prefix, attr, value, targetNode) {
        var methods = this._methods[prefix];
        if (!methods) {
            methods = this._methods[prefix] = {};
        }
        var func = methods[attr];
        if (!func) {
            attr = attr.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
            var funcName = prefix + attr.substr(0, 1).toUpperCase() + attr.substr(1);
            func = targetNode[funcName];
            if (!func) {
                throw SceneJS_errorModule.fatalError("Attribute '" + attr + "' not found on node '" + targetNode.attr.id + "' for " + prefix);
            }
            methods[attr] = func;
        }
        //func.call(targetNode, this._parseAttr(attr, value));
        func.call(targetNode, value);

        /* TODO: optimise - dont fire unless listener exists
         */
        var params = {};
        params[attr] = value;
        SceneJS_compileModule.nodeUpdated(targetNode, prefix, attr, value);

        /* TODO: event should be queued and consumed to avoid many of these events accumulating
         */
        targetNode._fireEvent("updated", params);
    };

    NodeSelector.prototype._callNodeMethods = function(prefix, attr, targetNode) {
        var methods = this._methods[prefix];
        if (!methods) {
            methods = this._methods[prefix] = {};
        }
        for (var key in attr) {
            if (attr.hasOwnProperty(key)) {
                var func = methods[key];
                if (!func) {
                    key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
                    var funcName = prefix + key.substr(0, 1).toUpperCase() + key.substr(1);
                    func = targetNode[funcName];
                    if (!func) {
                        throw SceneJS_errorModule.fatalError("Attribute '" + key + "' not found on node '" + targetNode.attr.id + "' for " + prefix);
                    }
                    methods[key] = func;
                }
                //func.call(targetNode, this._parseAttr(key, attr[key]));
                func.call(targetNode, attr[key]);
                SceneJS_compileModule.nodeUpdated(targetNode, prefix, key, attr[key]);
            }
        }

        /* TODO: optimise - dont fire unless listener exists
         */
        /* TODO: event should be queued and consumed to avoid many of these events accumulating
         */
        targetNode._fireEvent("updated", { attr: attr });
    };

    /** Given an attribute name of the form "alpha.beta" and a value, returns this sort of thing:
     *
     * {
     *     "alpha": {
     *         "beta": value
     *     }
     * }
     *
     */
    NodeSelector.prototype._parseAttr = function(attr, value) {
        var tokens = attr.split(".");
        if (tokens.length <= 1) {
            return value;
        }
        var obj = {};
        var root = obj;
        var name;
        var i = 0;
        var len = tokens.length - 1;

        while (i < len) {
            obj[tokens[i++]] = value;
        }
        obj = obj[name] = {};

        return root;
    };

})();