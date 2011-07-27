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


/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '2.0.0',

    /** Names of supported WebGL canvas contexts
     */
    SUPPORTED_WEBGL_CONTEXT_NAMES:["webgl", "experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /**
     * Node classes
     * @private
     */
    _nodeTypes: {},

    /**
     * Map of existing scene nodes
     */
    _scenes: {},

    /** Extension point to create a new node type.
     *
     * @param {string} type Name of new subtype
     * @param {string} superType Optional name of super-type - {@link SceneJS_node} by default
     * @return {class} New node class
     */
    createNodeType : function(type, superType) {
        if (!type) {
            throw SceneJS_errorModule.fatalError("createNodeType param 'type' is null or undefined");
        }
        if (typeof type != "string") {
            throw SceneJS_errorModule.fatalError("createNodeType param 'type' should be a string");
        }
        if (this._nodeTypes[type]) {
            throw SceneJS_errorModule.fatalError("createNodeType node of param 'type' already defined: '" + superType + "'");
        }
        var supa = this._nodeTypes[superType];
        if (!supa) {
            supa = SceneJS._Node;
        }
        var nodeType = function() {                  // Create class
            supa.apply(this, arguments);
            this.attr.type = type;
        };
        SceneJS._inherit(nodeType, supa);
        this._nodeTypes[type] = nodeType;
        return nodeType;
    },

    _registerNode : function(type, nodeClass) {
        this._nodeTypes[type] = nodeClass;
    },

    /**
     * Factory function to create a "scene" node
     */
    createScene : function(json) {
        if (!json) {
            throw SceneJS_errorModule.fatalError("createScene param 'json' is null or undefined");
        }
        json.type = "scene";
        if (!json.id) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "createScene 'id' is mandatory for 'scene' node");
        }
        if (this._scenes[json.id]) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "createScene - scene id '" + json.id + "' already taken by another scene");
        }
        var newNode = this._parseNodeJSON(json, undefined); // Scene references itself as the owner scene
        this._scenes[json.id] = newNode;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.NODE_CREATED, { nodeId : newNode.attr.id, json: json });
        return SceneJS._selectNode(newNode);
    },

    /** Returns true if the "scene" node with the given ID exists
     */
    sceneExists : function(sceneId) {
        return this._scenes[sceneId] ? true : false;
    },

    /** Select a "scene" node
     */
    scene : function(sceneId) {
        var scene = this._scenes[sceneId];
        if (!scene) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "withScene scene not found: '" + sceneId + "'");
        }
        return SceneJS._selectNode(scene);
    },

    _parseNodeJSON : function(json, scene) {
        var newNode = this._createNode(json, scene)
        scene = scene || newNode;
        newNode.scene = scene;
        if (json.nodes) {
            var len = json.nodes.length;
            for (var i = 0; i < len; i++) {
                newNode.addNode(SceneJS._parseNodeJSON(json.nodes[i], scene));
            }
        }
        return newNode;
    },


    _createNode : function(json, scene) {
        json.type = json.type || "node";
        var nodeType;
        if (json.type == "node") {
            nodeType = SceneJS._Node;
        } else {
            nodeType = this._nodeTypes[json.type];
            if (!nodeType) {
                throw SceneJS_errorModule.fatalError("Scene node type not supported in SceneJS " + SceneJS.VERSION + ": '" + json.type + "'");
            }
        }
        return new nodeType(json, scene);
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

    /** Nodes that are scheduled to be destroyed. When a node is destroyed it is added here, then at the end of each
     * render traversal, each node in here is popped and has {@link SceneJS_node#destroy} called.
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
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.NODE_DESTROYED, { nodeId : node.attr.id });
            }
            this._destroyedNodes = [];
        }
    },

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
                throw SceneJS_errorModule.fatalError("sendMessage param 'message' null or undefined");
            }
            var commandId = message.command;
            if (!commandId) {
                throw SceneJS_errorModule.fatalError("Message element expected: 'command'");
            }
            var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
            var command = commandService.getCommand(commandId);

            if (!command) {
                throw SceneJS_errorModule.fatalError("Message command not supported: '" + commandId + "' - perhaps this command needs to be added to the SceneJS Command Service?");
            }
            var ctx = {};
            command.execute(ctx, message);
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
        var uuid = [];
        for (var i = 0; i < 38; i++) {
            switch (i) {
                case 8:uuid.push("-");
                    break;
                case 13:uuid.push("-");
                    break;
                case 18:uuid.push("-");
                    break;
                case 14:uuid.push("4");
                    break;
                case 19:uuid.push(data2[Math.round(Math.random() * 3)]);
                    break;
                default:uuid.push(data[Math.round(Math.random() * 15)]);
                    break;
            }
        }
        return uuid.join("");
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
    },



    /** Lazy-bound state resources published by "suppliers"
     */
    _compilationStates : new (function() {
        var suppliers = {};
        this.setSupplier = function(type, supplier) {
            suppliers[type] = supplier;
        };
        this.getState = function(type, sceneId, id) {
            var s = suppliers[type];
            if (!s) {
                throw SceneJS_errorModule.fatalError("Internal error - Compilation state supplier not found: '" + type + "'");
            }
            return s.get(sceneId, id);
        };
    })()
};
