/** Generic map of IDs to items - can generate own IDs or accept given IDs.
 * Given IDs should be strings in order to not clash with internally generated IDs, which are numbers.
 */
var SceneJS_Map = function() {
    this.items = [];
    this.lastUniqueId = 0;

    this.addItem = function() {
        var item;
        if (arguments.length == 2) {
            var id = arguments[0];          
            item = arguments[1];
            if (this.items[id]) { // Won't happen if given ID is string
                throw SceneJS_errorModule.fatalError(SceneJS.errors.ID_CLASH, "ID clash: '" + id + "'");
            }
            this.items[id] = item;
            return id;
        } else {
            while (true) {
                item = arguments[0];
                var findId = this.lastUniqueId++ ;
                if (!this.items[findId]) {
                    this.items[findId] = item;
                    return findId;
                }
            }
        }
    };

    this.removeItem = function(id) {
        this.items[id] = null;
    };
};

var SceneJS_nodeMap = new SceneJS_Map();

/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '0.8',

    /** Names of supported WebGL canvas contexts
     */
    SUPPORTED_WEBGL_CONTEXT_NAMES:["webgl", "experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

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
            this._attr.nodeType = type;
        };
        SceneJS._inherit(nodeType, supa.nodeClass);

        var nodeFunc = function() {                // Create factory function
            var n = new nodeType();
            nodeType.prototype.constructor.apply(n, arguments);
            n._attr.nodeType = type;
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
        if (json.parent) {
            if (json.type == "scene") {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "createNode 'parent' not expected for 'scene' node");
            }
            if (json.parent == json.id) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_NOT_FOUND,
                        "createNode 'parent' cannot equal 'id'");
            }
            var parent = SceneJS_nodeMap.items[json.parent];
            if (!parent) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_NOT_FOUND,
                        "createNode 'parent' not resolved");
            }
            var newNode = this._parseNodeJSON(json, parent._scene);
            SceneJS.withNode(parent).add("node", newNode); // Fires events and compilation triggering
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.NODE_CREATED, { nodeId : newNode.getId(), json: json });
            return SceneJS.withNode(newNode);
        } else {
            if (json.type != "scene") {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "createNode 'parent' is expected for all node types except 'scene'");
            }
            var newNode = this._parseNodeJSON(json, undefined); // Scene references itself as the owner scene
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.NODE_CREATED, { nodeId : newNode.getID(), json: json });
            return SceneJS.withNode(newNode);
        }
    },

    /**
     * Parses JSON into a subgraph of nodes using iterative depth-first search
     */
    _parseNodeJSON : function(v, scene) {
        v.__visited = true;
        v.__node = this._createNode(v, scene);
        scene = scene || v.__node;
        var s = [];
        var i, len;
        if (v.nodes) {
            for (i = 0,len = v.nodes.length; i < len; i++) {
                var child = v.nodes[i];
                child.__node = this._createNode(child, scene);
                child.__parent = v;
                s.push(child);
            }
        }
        var w;
        var u;
        while (s.length > 0) {
            w = s.pop();
            w.__parent.__node.insertNode(w.__node, 0);

            if (w.nodes) {
                for (i = 0,len = w.nodes.length; i < len; i++) {
                    u = w.nodes[i];
                    if (!u.__parent) {
                        u.__node = this._createNode(u, scene);
                        u.__parent = w;
                        s.push(u);
                    }
                }
            }
        }
        return v.__node;
    },

    _createNode : function(json, scene) {
        json.type = json.type || "node";
        var nodeType = this._nodeTypes[json.type];
        if (!nodeType) {
            throw "Failed to parse JSON node definition - unknown node type: '" + json.type + "'";
        }
        return new nodeType.nodeClass(json, scene);   // Faster to instantiate class directly
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
        var node = SceneJS_nodeMap.items[id];
        return (node != undefined && node != null);
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
        if (this._destroyedNodes.length > 0) {
            var node;
            for (var i = this._destroyedNodes.length - 1; i >= 0; i--) {
                node = this._destroyedNodes[i];
                node._doDestroy();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.NODE_DESTROYED, { nodeId : node.getID() });
            }
            this._destroyedNodes = [];
        }
    },

    /**
     * Node factory funcs mapped to type
     * @private
     */
    _nodeTypes: {},

    /**
     * Links each node that is an instance target back to
     * it's instance- for each target node a map of the
     * {@link SceneJS.Instance} nodes pointing to it
     */
    _nodeInstanceMap : {},

    /*----------------------------------------------------------------------------------------------------------------
     * Messaging System
     *
     *
     *--------------------------------------------------------------------------------------------------------------*/

    Message : new (function() {

        /** Sends a message to SceneJS - docs at http://scenejs.wikispaces.com/SceneJS+Messaging+System
         *
         * @param message
         */
        this.sendMessage = function (message) {
            if (!message) {
                throw "sendMessage param 'message' null or undefined";
            }
            var commandId = message.command;
            if (!commandId) {
                throw "Message element expected: 'command'";
            }
            var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
            var command = commandService.getCommand(commandId);

            if (!command) {
                throw "Message command not supported: '" + commandId + "' - perhaps this command needs to be added to the SceneJS Command Service?";
            }
            command.execute(message);
        };
    })(),

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
    // Add a new function that returns a unique map key.
    _last_unique_id: 0,
    _createKeyForMap : function(keyMap, prefix) {
        while (true) {
            var key = prefix ? prefix + SceneJS._last_unique_id++ : SceneJS._last_unique_id++;
            if (!keyMap[key]) {
                return key;
            }
        }
    },

    /** Stolen from GLGE:https://github.com/supereggbert/GLGE/blob/master/glge-compiled.js#L1656
     */
    _createUUID:function() {
        var data = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
        var data2 = ["8","9","A","B"];
        var uuid = "";
        for (var i = 0; i < 38; i++) {
            switch (i) {
                case 8:uuid = uuid + "-";
                    break;
                case 13:uuid = uuid + "-";
                    break;
                case 18:uuid = uuid + "-";
                    break;
                case 14:uuid = uuid + "4";
                    break;
                case 19:uuid = uuid + data2[Math.round(Math.random() * 3)];
                    break;
                default:uuid = uuid + data[Math.round(Math.random() * 15)];
                    break;
            }
        }
        return uuid;
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
    },

    _shallowClone : function(o) {
        var o2 = {};
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                o2[name] = o[name]
            }
        }
        return o2;
    } ,

    /** Add properties of o to o2 where undefined or null on o2
     */
    _applyIf : function(o, o2) {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                if (o2[name] == undefined || o2[name] == null) {
                    o2[name] = o[name];
                }
            }
        }
        return o2;
    },

    /** Add properties of o to o2, overwriting them on o2 if already there
     */
    _apply : function(o, o2) {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                o2[name] = o[name];
            }
        }
        return o2;
    }
};

SceneJS._namespace("SceneJS");

window["SceneJS"] = SceneJS;


