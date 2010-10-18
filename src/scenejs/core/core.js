/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '0.7.8',

    /** Names of supported WebGL canvas contexts
     */
    SUPPORTED_WEBGL_CONTEXT_NAMES:["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /** Extension point to create a new node type.
     *
     * @param {string} type Name of new subtype
     * @param {string} superType Optional name of super-type - {@link SceneJS.Node} by default
     * @return {class} New node class
     */
    createNodeType : function(type, superType) {
        if (!type) {
            throw "createNodeType param 'type' is null or undefined";
        }
        if (typeof type != "string") {
            throw "createNodeType param 'type' should be a string";
        }
        var supa = this._nodeTypes[superType || "node"];
        if (!supa) {
            throw "undefined superType: '" + superType + "'";
        }
        var nodeType = function() {                  // Create class
            supa.nodeClass.apply(this, arguments);
            this._nodeType = type;
        };
        SceneJS._inherit(nodeType, supa.nodeClass);

        var nodeFunc = function() {                // Create factory function
            var n = new nodeType();
            nodeType.prototype.constructor.apply(n, arguments);
            n._nodeType = type;
            return n;
        };
        this._registerNode(type, nodeType, nodeFunc);
        SceneJS[type] = nodeFunc;
        return nodeType;
    },

    _registerNode : function(type, nodeClass, nodeFunc) {
        this._nodeTypes[type] = {
            nodeClass : nodeClass,
            nodeFunc: nodeFunc
        };
    },

    /**
     * Factory function to create a scene (sub)graph from JSON
     * @param json
     * @return {SceneJS.Node} Root of (sub)graph
     */
    createNode : function(json) {
        if (!json) {
            throw "createNode param 'json' is null or undefined";
        }
        var newNode = this._parseNodeJSON(json);
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.NODE_CREATED, { nodeId : newNode.getID(), json: json });
        return SceneJS.withNode(newNode);
    },

    _parseNodeJSON : function(json) {
        json.type = json.type || "node";
        var nodeType = this._nodeTypes[json.type];
        if (!nodeType) {
            throw "Failed to parse JSON node definition - unknown node type: '" + json.type + "'";
        }
        var newNode = new nodeType.nodeClass(this._copyCfg(json));   // Faster to instantiate class directly
        if (json.nodes) {
            var len = json.nodes.length;
            for (var i = 0; i < len; i++) {
                newNode.addNode(SceneJS._parseNodeJSON(json.nodes[i]));
            }
        }
        return newNode;
    },

    /**
     * Shallow copy of JSON node configs, filters out JSON-specific properties like "nodes"
     * @private
     */
    _copyCfg : function (cfg) {
        var cfg2 = {};
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key) && key != "nodes") {
                cfg2[key] = cfg[key];
            }
        }
        return cfg2;
    },

    /** Schedule the destruction of a node
     * @private
     */
    _scheduleNodeDestroy : function(node) {
        this._destroyedNodes.push(node);
    },

    /** Nodes that are scheduled to be destroyed. When a node is destroyed it is added here, then at the end of each
     * render traversal, each node in here is popped and has {@link SceneJS.Node#destroy} called.
     *  @private
     */
    _destroyedNodes : [],

    /** Action the scheduled destruction of nodes
     * @private
     */
    _actionNodeDestroys : function() {
        var node;
        for (var i = this._destroyedNodes.length - 1; i >= 0; i--) {
            node = this._destroyedNodes[i];
            node._doDestroy();
            SceneJS._eventModule.fireEvent(SceneJS._eventModule.NODE_CREATED, { nodeId : node.getID() });
        }
        this._destroyedNodes = [];
    },

    /**
     * Node factory funcs mapped to type
     * @private
     */
    _nodeTypes: {
    },

    /**
     * ID map of all existing nodes.
     * Referenced by {@link SceneJS.Node}.
     * @private
     */
    _nodeIDMap : {
    },

    /**
     * Links each node that is an instance target back to
     * it's instance- for each target node a map of the
     * {@link SceneJS.Instance} nodes pointing to it
     */
    _nodeInstanceMap : {
    },

    /** Selects a scene graph node by its ID and provides a set of methods to modify and observe it.
     * @returns {Object} Handle to node
     */
    withNode : function(node) {
        if (!node) {
            throw "withNode param 'node' is null or undefined";
        }
        var targetNode = node._render ? node : SceneJS._nodeIDMap[node];
        if (!targetNode) {
            throw "withNode node not found: '" + node + "'";
        }
        return {

            /** Selects the parent of the selected node
             */
            parent : function() {
                var parent = targetNode.getParent();
                if (!parent) {
                    return null;
                }
                return SceneJS.withNode(parent);
            },

            /** Selects a child node matching given ID or index
             * @param {Number|String} node Child node index or ID
             */
            node: function(node) {
                if (node === null || typeof(node) === "undefined") {
                    throw "node param 'node' is null or undefined";
                }
                var type = typeof node;
                var nodeGot;
                if (type == "number") {
                    nodeGot = targetNode.getNodeAt(node);
                } else if (type == "string") {
                    nodeGot = targetNode.getNode(node);
                } else {
                    throw "node param 'node' should be either an index number or an ID string";
                }
                if (!nodeGot) {
                    throw "node not found: '" + node + "'";
                }
                return SceneJS.withNode(nodeGot);
            },


//            hasNode: function(node) {
//
//            },
            
            /**
             * Iterates over parent nodes on the path from the selected node to the root, executing a function
             * for each.
             * If the function returns true at any node, then traversal stops and a selector is
             * returned for that node.
             * @param {Function(node, index)} fn Function to execute on each instance node
             * @return {Object} Selector for selected node, if any
             */
            eachParent : function(fn) {
                if (!fn) {
                    throw "eachParent param 'fn' is null or undefined";
                }
                var selector;
                var count = 0;
                while (node._parent) {
                    selector = SceneJS.withNode(node._parent);
                    if (fn.call(selector, count++) == true) {
                        return selector;
                    }
                    node = node._parent;
                }
                return undefined;
            },

            /**
             * Iterates over sub-nodes of the selected node, executing a function
             * for each. With the optional options object we can configure is depth-first or breadth-first order.
             * If neither, then only the child nodes are iterated.
             * If the function returns true at any node, then traversal stops and a selector is
             * returned for that node.
             * @param {Function(index, node)} fn Function to execute on each child node
             * @return {Object} Selector for selected node, if any
             */
            eachNode : function(fn, options) {
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
                    if (fn.call(this, count++) == true) {
                        return this;
                    }
                }
                if (!options.depthFirst && !options.breadthFirst) {
                    stoppedNode = iterateEachNode(fn, targetNode, count);
                } else if (options.depthFirst) {
                    stoppedNode = iterateEachNodeDepthFirst(fn, targetNode, count, false); // Not below root yet
                } else {
                    // TODO: breadth-first
                }
                if (stoppedNode) {
                    return SceneJS.withNode(stoppedNode);
                }
                return undefined; // IDE happy now
            },

            numNodes : function() {
                return targetNode._children.length;
            },

            /**
             * Iterates over instance nodes that target the selected node, executing a function
             * for each.
             * If the function returns true at any node, then traversal stops and a selector is
             * returned for that node.
             * @param {Function(index, node)} fn Function to execute on each instance node
             * @return {Object} Selector for selected node, if any
             */
            eachInstance : function(fn) {
                if (!fn) {
                    throw "eachInstance param 'fn' is null or undefined";
                }
                if (typeof fn != "function") {
                    throw "eachInstance param 'fn' should be a function";
                }
                var instances = SceneJS._nodeInstanceMap[node._id];
                if (instances) {
                    var count = 0;
                    var selector;
                    for (var instanceNodeId in instances) {
                        if (instances.hasOwnProperty(instanceNodeId)) {
                            selector = SceneJS.withNode(instanceNodeId);
                            if (fn.call(selector, count++) == true) {
                                return selector;
                            }
                        }
                    }
                }
                return undefined;
            },

            numInstances : function() {
                var instances = SceneJS._nodeInstanceMap[node._id];
                return instances ? instances.numInstances : 0;
            },

            /** Sets an attribute of the selected node
             */
            set: function(attr, value) {
                if (!attr) {
                    throw "set param 'attr' null or undefined";
                }
                if (typeof attr == "string") {
                    SceneJS._callNodeMethod("set", attr, value, targetNode);
                } else {
                    SceneJS._callNodeMethods("set", attr, targetNode);
                }
                return this;
            },

            /** Adds an attribute to the selected node
             */
            add: function(attr, value) {
                if (!attr) {
                    throw "add param 'attr' null or undefined";
                }
                if (typeof attr == "string") {
                    SceneJS._callNodeMethod("add", attr, value, targetNode);
                } else {
                    SceneJS._callNodeMethods("add", attr, targetNode);
                }
                return this;
            },

            /** Inserts an attribute or child node into the selected node
             */
            insert: function(attr, value) {
                if (!attr) {
                    throw "insert param 'attr' null or undefined";
                }
                if (typeof attr == "string") {
                    SceneJS._callNodeMethod("insert", attr, value, targetNode);
                } else {
                    SceneJS._callNodeMethods("insert", attr, targetNode);
                }
                return this;
            },

            /** Removes an attribute from the selected node
             */
            remove: function(attr, value) {
                if (!attr) {
                    throw "remove param 'attr' null or undefined";
                }
                if (typeof attr == "string") {
                    SceneJS._callNodeMethod("remove", attr, value, targetNode);
                } else {
                    SceneJS._callNodeMethods("remove", attr, targetNode);
                }
                return this;
            },

            /** Returns the value of an attribute of the selected node
             */
            get: function(attr) {
                if (!attr) {
                    throw "get param 'attr' null or undefined";
                }
                var funcName = "get" + attr.substr(0, 1).toUpperCase() + attr.substr(1);
                var func = targetNode[funcName];
                if (!func) {
                    throw "Attribute '" + attr + "' not found on node '" + targetNode.getID() + "'";
                }
                return func.call(targetNode);
            } ,

            /** Binds a listener to an event on the selected node
             *
             * @param {String} name Event name
             * @param {Function} fn Event handler
             */
            bind : function(name, fn) {
                if (!name) {
                    throw "bind param 'name' null or undefined";
                }
                if (typeof name != "string") {
                    throw "bind param 'name' should be a string";
                }
                if (!fn) {
                    throw "bind param 'fn' null or undefined";
                }
                if (typeof fn != "function") {
                    throw "bind param 'fn' should be a function";
                }
                targetNode.addListener(name, fn, { scope: this });
                return this;
            },

            /**
             * Performs pick on the selected scene node, which must be a scene.
             * @param offsetX Canvas X-coordinate
             * @param offsetY Canvas Y-coordinate
             */
            pick : function(offsetX, offsetY) {
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
                if (targetNode.getType() != "scene") {
                    throw "pick attempted on node that is not a \"scene\" type: '" + targetNode.getID() + "'";
                }
                targetNode.pick(offsetX, offsetY);
                return this;
            },

            /**
             * Renders the selected scene node, which must be a scene.
             */
            render : function () {
                if (targetNode.getType() != "scene") {
                    throw "render attempted on node that is not a \"scene\" type: '" + targetNode.getID() + "'";
                }
                targetNode.render();
                return this;
            },

            /**
             * Starts the selected scene node, which must be a scene.
             */
            start : function (cfg) {
                if (targetNode.getType() != "scene") {
                    throw "start attempted on node that is not a \"scene\" type: '" + targetNode.getID() + "'";
                }
                cfg = cfg || {};
                if (cfg.idleFunc) {    // Wrap idleFunc to call on selector as scope
                    var fn = cfg.idleFunc;
                    cfg.idleFunc = function() {
                        fn(this);
                    };
                }
                targetNode.start(cfg);
                return this;
            },

            /**
             * Stops the selected scene node, which must be a scene.
             */
            stop : function () {
                if (targetNode.getType() != "scene") {
                    throw "stop attempted on node that is not a \"scene\" '" + targetNode.getID() + "'";
                }
                targetNode.stop();
                return this;
            },

            /**
             * Destroys the selected scene node, which must be a scene.
             */
            destroy : function() {
                if (targetNode.getType() != "scene") {
                    throw "destroy attempted on node that is not a \"scene\" type: '" + targetNode.getID() + "'";
                }
                targetNode.destroy();
                return this;
            },

            /** Allows us to get or set data of any type on the scene node
             */
            data: function(data, value) {
                if (!data) {
                    return targetNode._data;
                }
                targetNode._data = targetNode._data || {};
                if (typeof data == "string") {
                    if (value != undefined) {
                        targetNode._data[data] = value;
                        return this;
                    } else {
                        return targetNode._data[data];
                    }
                } else {
                    if (value != undefined) {
                        targetNode._data = value;
                        return this;
                    } else {
                        return targetNode._data;
                    }
                }
            }
        };

        function iterateEachNode(fn, node, count) {
            var len = node._children.length;
            var selector;
            for (var i = 0; i < len; i++) {
                selector = SceneJS.withNode(node._children[i]);
                if (fn.call(selector, count++) == true) {
                    return selector;
                }
            }
            return undefined;
        }

        function iterateEachNodeDepthFirst(fn, node, count, belowRoot) {
            var selector;
            if (belowRoot) {

                /* Visit this node - if we are below root, because entry point visits the root
                 */
                selector = SceneJS.withNode(node);
                if (fn.call(selector, count++) == true) {
                    return selector;
                }
            }
            belowRoot = true;

            /* Iterate children
             */
            var len = node._children.length;
            for (var i = 0; i < len; i++) {
                selector = iterateEachNodeDepthFirst(fn, node._children[i], count, belowRoot);
                if (selector) {
                    return selector;
                }
            }
            return undefined;
        }
    },

    /** Returns true if the {@link SceneJS.Node} with the given ID exists
     *
     * @param id ID of {@link SceneJS.Node} to find
     * @returns {Boolean} True if node exists else false
     */
    nodeExists : function(id) {
        if (!id) {
            throw "nodeExists param 'id' null or undefined";
        }
        if (typeof id != "string") {
            throw "nodeExists param 'id' not a string";
        }
        var node = SceneJS._nodeIDMap[id];
        return (node != undefined && node != null);
    },

    /** SceneJS messaging system
     */
    Message : new (function() {

        /** Sends a message to SceneJS - docs at http://scenejs.wikispaces.com/SceneJS+Messaging+System
         *
         * @param message
         */
        this.sendMessage = function (message) {
            if (!message) {
                throw "sendMessage param 'message' null or undefined";
            }
            var command = message.command;
            if (!command) {
                throw "Message element expected: 'command'";
            }

            /* Create a node
             */
            if (command == "create") {
                var nodes = message.nodes;
                if (nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                        if (!nodes[i].id) {
                            throw "Message 'create' must have ID for new node";
                        }
                        SceneJS.createNode(nodes[i]);
                    }
                }

                /* Update a target node
                 */
            } else if (command == "update") {
                var target = message.target;
                if (target) {
                    var targetNode = SceneJS._nodeIDMap[target];
                    if (!targetNode) {
                        throw "Message 'update' target node not found: " + target;
                    }

                    var sett = message["set"];
                    if (sett) {
                        SceneJS._callNodeMethods("set", sett, targetNode);
                    }

                    var insert = message.insert;
                    if (insert) {
                        SceneJS._callNodeMethods("insert", insert, targetNode);
                    }

                    var add = message.add;
                    if (add) {
                        SceneJS._callNodeMethods("add", add, targetNode);
                    }

                    var remove = message.remove;
                    if (remove) {
                        SceneJS._callNodeMethods("remove", remove, targetNode);
                    }
                }
            }

            /* Further messages
             */
            var messages = message.messages;
            if (messages) {
                for (var i = 0; i < messages.length; i++) {
                    this.sendMessage(messages[i]);
                }
            }
        };


    })(),

    _callNodeMethod: function(prefix, attr, value, targetNode) {
        var funcName = prefix + attr.substr(0, 1).toUpperCase() + attr.substr(1);
        var func = targetNode[funcName];
        if (!func) {
            throw "Attribute '" + attr + "' not found on node '" + targetNode.getID() + "'";
        }
        func.call(targetNode, value);

        /* TODO: optimise - dont fire unless listener exists
         */
        var params = {};
        params[attr] = value;

        /* TODO: event should be queued and consumed to avoid many of these events accumulating
         */
        targetNode._fireEvent("updated", params);
        //   SceneJS._eventModule.fireEvent(SceneJS._eventModule.NODE_UPDATED, { nodeId : node.getID() });
    } ,

    _callNodeMethods : function(prefix, attr, targetNode) {
        for (var key in attr) {
            if (attr.hasOwnProperty(key)) {
                key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
                var funcName = prefix + key.substr(0, 1).toUpperCase() + key.substr(1);
                var func = targetNode[funcName];
                if (!func) {
                    throw "Attribute '" + key + "' not found on node '" + targetNode.getID() + "'";
                }
                func.call(targetNode, attr[key]);
            }
        }

        /* TODO: optimise - dont fire unless listener exists
         */
        /* TODO: event should be queued and consumed to avoid many of these events accumulating
         */
        targetNode._fireEvent("updated", { attr: attr });
    } ,



    /** @private */
    _traversalMode :0x1,

    /** @private */
    _TRAVERSAL_MODE_RENDER:0x1,

    /** @private */
    _TRAVERSAL_MODE_PICKING:0x2,

    /**
     * @private
     */
    _inherit:function(DerivedClassName, BaseClassName) {
        DerivedClassName.prototype = new BaseClassName();
        DerivedClassName.prototype.constructor = DerivedClassName;
    },

    /** Creates a namespace
     * @private
     */
    _namespace : function() {
        var a = arguments, o = null, i, j, d, rt;
        for (i = 0; i < a.length; ++i) {
            d = a[i].split(".");
            rt = d[0];
            eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
            for (j = 1; j < d.length; ++j) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
    },

    /**
     * Returns a key for a vacant slot in the given map
     * @private
     */
    _createKeyForMap : function(keyMap, prefix) {
        var i = 0;
        while (true) {
            var key = prefix + i++;
            if (!keyMap[key]) {
                return key;
            }
        }
    },

    /** Applies properties on o2 to o1 where not already on o1
     *
     * @param o1
     * @param o2
     * @private
     */
    _applyIf : function(o1, o2) {
        for (var key in o2) {
            if (!o1[key]) {
                o1[key] = o2[key];
            }
        }
        return o1;
    },

    _getBaseURL : function(url) {
        var i = url.lastIndexOf("/");
        if (i == 0 || i == -1) {
            return "";
        }
        return url.substr(0, i + 1);
    },

    /**
     * Returns true if object is an array
     * @private
     */
    _isArray : function(testObject) {
        return testObject && !(testObject.propertyIsEnumerable('length'))
                && typeof testObject === 'object' && typeof testObject.length === 'number';
    }
} ;

SceneJS._namespace("SceneJS");

window["SceneJS"] = SceneJS;


