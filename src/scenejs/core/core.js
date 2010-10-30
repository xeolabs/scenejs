/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '0.7.9.0',

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
    _nodeTypes: {},

    /**
     * ID map of all existing nodes.
     * Referenced by {@link SceneJS.Node}.
     * @private
     */
    _nodeIDMap : {},

    /**
     * Links each node that is an instance target back to
     * it's instance- for each target node a map of the
     * {@link SceneJS.Instance} nodes pointing to it
     */
    _nodeInstanceMap : {},

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
     * True when a state change of any sort happens within Scenes, where Scene then need to render another frame.
     * This is set when updates are made through the JSON Scene Graph API. It is very crude; change in one scene
     * causes all scenes to render a frame, but then perhaps that is OK, or even a good idea?
     */
    _needFrame : true,

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


