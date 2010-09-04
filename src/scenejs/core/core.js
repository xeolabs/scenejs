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
    },

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
        json.type = json.type || "node";
        var nodeType = this._nodeTypes[json.type];
        if (!nodeType) {
            throw "Node type not registered: '" + json.type + "'";
        }
        var newNode = new nodeType.nodeClass(this._copyCfg(json));   // Faster to instantiate class directly
        if (json.nodes) {
            var len = json.nodes.length;
            for (var i = 0; i < len; i++) {
                newNode.addNode(SceneJS.createNode(json.nodes[i]));
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

    /**
     * Fire an event at the node with the given ID
     *
     * @param {String} name Event name
     * @param {String} target ID of target node
     * @param {Object} params Event parameters
     */
    fireEvent : function(name, target, params) {
        var node = this.getNode(target);
        if (!node) {
            throw "Node with this ID not found: '" + target + "'";
        }
        node.addEvent({ name: name, params: params });
    },

    /**
     * Preprocesses the given configs map for fast application to nodes.
     * @private
     * @param configs
     */
    _preprocessConfigs : function(configs) {
        var pattern;
        var action;
        var propKey;
        var propName;
        var newConfigs = {};

        for (var key in configs) {

            if (configs.hasOwnProperty(key)) {
                key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim

                if (key.length > 0) {
                    pattern = key.substr(0, 1);

                    if (pattern != "#" && pattern != "*") {

                        /* Reference to node method
                         */
                        if (pattern == "+") {
                            action = "add";
                            propKey = key.substr(1);
                            propName = key.substr(1, 1).toUpperCase() + key.substr(2);

                        } else if (pattern == "-") {
                            action = "remove";
                            propKey = key.substr(1);
                            propName = key.substr(1, 1).toUpperCase() + key.substr(2);

                        } else {
                            action = "set";
                            propKey = key.substr(0);
                            propName = key.substr(0, 1).toUpperCase() + key.substr(1);
                        }

                        newConfigs[key] = {
                            pattern: (action != "set") ? pattern : null,
                            action: action,
                            propKey : propKey,
                            propName: propName,
                            value : configs[key]
                        };

                    } else {

                        /* Reference to node.
                         *
                         * Keep the special char (eg '#') on the
                         * child node selector - we'll need it for
                         * doing fancy selection (wildcards etc) when we apply it
                         */
                        newConfigs[key] = this._preprocessConfigs(configs[key]);
                    }
                }
            }
        }
        return newConfigs;
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

    /** Finds a {@link SceneJS.Node} by ID
     *
     * @param id ID of {@link SceneJS.Node} to find
     * @returns {SceneJS.Node} The node else null if not found
     */
    getNode : function(id) {
        return SceneJS._nodeIDMap[id];
    },

    /**
     * SceneJS IOC service registry
     */
    services : new (function() {

        this.NODE_SOURCE_SERVICE = "node-source";

        this._services = {};

        this.addService = function(name, service) {
            this._services[name] = service;
        };

        this.getService = function(name) {
            return this._services[name];
        };
    })()
};

SceneJS._namespace("SceneJS");

window["SceneJS"] = SceneJS;


