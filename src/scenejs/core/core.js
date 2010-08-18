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

    /**
     * Registers a node factory func against the node's type name. This is used
     * when we create nodes from JSON.
     *
     * @param {string} Type ID by which the node type may be looked up
     * @param {function} factoryFunc Factory function that constructs a new instance of the node
     */
    registerNodeType : function(type, factoryFunc) {
        this._nodeFactoryFuncs[type] = factoryFunc;
    },

    /**
     * Factory function to create a subgraph from JSON
     * @param json
     */
    createNode : function(json) {
        if (!json.type) {
            throw "Node type undefined";
        }
        var func = this._nodeFactoryFuncs[json.type];
        if (!func) {
            throw "Node type unregistered: '" + json.type + "'";
        }
        var cfg = json.cfg || {};
        var args = [cfg];
        if (json.nodes) {
            var len = json.nodes.length;
            for (var i = 0; i < len; i++) {
                args.push(SceneJS.createNode(json.nodes[i]));
            }
        }
        return func.apply(this, args);
    },

    /**
     * Node factory funcs mapped to type
     * @private
     */
    _nodeFactoryFuncs: {},

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
    }

};

SceneJS._namespace("SceneJS");

window["SceneJS"] = SceneJS;


