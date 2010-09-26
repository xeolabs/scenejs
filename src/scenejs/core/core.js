/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '0.7.7',

    /** Names of supported WebGL canvas contexts
     */
    SUPPORTED_WEBGL_CONTEXT_NAMES:["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /** Creates a new {@link SceneJS.Node} subtype.
     *
     * @param {string} type Name of new subtype
     * @param {string} superType Optional name of super-type - {@link SceneJS.Node} by default
     * @return {class} New node class
     */
    createNodeType : function(type, superType) {
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
        return SceneJS.withNode(this._parseNodeJSON(json));
    },

    _parseNodeJSON : function(json) {
        json.type = json.type || "node";
        var nodeType = this._nodeTypes[json.type];
        if (!nodeType) {
            throw "Node type not registered: '" + json.type + "'";
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

    /** Selects a scene graph node by its ID and provides a set of methods to modify and observe it.
     * @returns {Object} Handle to node
     */
    withNode : function(node) {
        if (!node) {
            throw "SceneJS.withNode node argument is null";
        }
        var targetNode = node._render ? node : SceneJS._nodeIDMap[node];
        if (!targetNode) {
            throw "Node not found: '" + node + "'";
        }
        return {

            /** Selects the parent of the selected node
             */
            parent : function() {
                var parent = targetNode.getParent();
                if (!parent) {
                    throw "Selected node has no parent";
                }
                return SceneJS.withNode(parent);
            },

//            /** Selects a child node matching given ID or index
//             * @param {Number|String} node Child node index or ID
//             */
//            node: function(node) {
//                var type = typeof node;
//                var nodeGot;
//                if (type == "number") {
//                    nodeGot = targetNode.getNodeAt(node);
//                } else if (type == "string") {
//                    nodeGot = targetNode.getNode(node);
//                } else {
//                    throw "Child node should be specified as ID or index";
//                }
//                if (!nodeGot) {
//                    throw "Child node " + node + " not found on selected node: " + targetNode.getID();
//                }
//                return SceneJS.withNode(nodeGot);
//            },
//
//            /**
//             * Iterates over child nodes of the selected node, executing a function
//             * for each child node. If the function returns true at any node, then a selector
//             * is returned for that node.
//             * @param {Function(index, node)} fn Function to execute on each child node
//             * @return {Object} Selector for selected node, if any
//             */
//            each : function(fn) {
//                var node = targetNode.eachNode(fn);
//                if (node) {
//                    return SceneJS.withNode(node);
//                }
//                return undefined; // IDE happy now
//            },

            /** Sets an attribute of the selected node
             */
            set: function(attr, value) {
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
                targetNode.addListener(name, fn, { scope: this });
                return this;
            },

            /**
             * Performs pick on the selected scene node, which must be a scene.
             * @param canvasX Canvas X-coordinate
             * @param canvasY Canvas Y-coordinate
             */
            pick : function(canvasX, canvasY) {
                if (targetNode.getType() != "scene") {
                    throw "Cannot do pick on this node - not a \"scene\" type: '" + targetNode.getID() + "'";
                }
                targetNode.pick(canvasX, canvasY);
                return this;
            },

            /**
             * Renders the selected scene node, which must be a scene.
             */
            render : function () {
                if (targetNode.getType() != "scene") {
                    throw "Cannot render this node - not a \"scene\" type: '" + targetNode.getID() + "'";
                }
                targetNode.render();
                return this;
            },

            /** Allows us to get or set data of any type on the scene node
             */
            data: function(data, value) {
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
    },

    /** Returns true if the {@link SceneJS.Node} with the given ID exists
     *
     * @param id ID of {@link SceneJS.Node} to find
     * @returns {Boolean} True if node exists else false
     */
    nodeExists : function(id) {
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
            var command = message.command;
            if (!command) {
                throw "Message command expected";
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
                    targetNode._fireEvent("updated");
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

    _callNodeMethod : function(prefix, attr, value, targetNode) {
        var funcName = prefix + attr.substr(0, 1).toUpperCase() + attr.substr(1);
        var func = targetNode[funcName];
        if (!func) {
            throw "Attribute '" + attr + "' not found on node '" + targetNode.getID() + "'";
        }
        func.call(targetNode, value);
    },

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
    },

    /**
     * Node factory funcs mapped to type
     * @private
     */
    _nodeTypes: {},

    /**
     * ID map of all existing nodes.
     * Referenced by {@link SceneJS.Node}.
     * @private
     */
    _nodeIDMap : {},

    /** @private */
    _traversalMode :0x1,

    /** @private */
    _TRAVERSAL_MODE_RENDER: 0x1,

    /** @private */
    _TRAVERSAL_MODE_PICKING:   0x2,

    /**
     * @private
     */
    _inherit : function(DerivedClassName, BaseClassName) {
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
};

SceneJS._namespace("SceneJS");

window["SceneJS"] = SceneJS;


