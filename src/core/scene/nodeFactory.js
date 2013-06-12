/**
 * @class Manages creation, recycle and destruction of {@link SceneJS.Node} instances
 * @private
 */
var SceneJS_NodeFactory = function () {

    // Nodes created by this factory
    this.nodes = new SceneJS_Map({});

    // Subscribers waiting for node types
    this._subs = {};
};

/**
 * Scene graph node classes provided by the SceneJS_NodeFactory class
 *
 * @type {[SceneJS.Node]}
 */
SceneJS_NodeFactory.nodeTypes = {};    // Supported node classes, installed by #createNodeType

/**
 * Creates a node class for instantiation by this factory
 *
 * @param {String} typeName Name of type, eg. "rotate"
 * @param {String} coreTypeName Optional name of core type for the node, eg. "xform" - defaults to type name of node
 * @returns The new node class
 */
SceneJS_NodeFactory.createNodeType = function (typeName, coreTypeName) {
    if (SceneJS_NodeFactory.nodeTypes[typeName]) {
        throw "Node type already defined: " + typeName;
    }
    var nodeType = function () { // Create the class
        SceneJS.Node.apply(this, arguments);
        this.type = typeName;
    };
    nodeType.prototype = new SceneJS.Node();            // Inherit from base class
    nodeType.prototype.constructor = nodeType;
    SceneJS_NodeFactory.nodeTypes[typeName] = nodeType;
    return nodeType;
};

/**
 *
 */
SceneJS_NodeFactory.prototype.getNode = function (engine, json, core, ok) {
    json.type = json.type || "node"; // Nodes are SceneJS.Node type by default
    var nodeType;
    if (json.type == "node") {
        nodeType = SceneJS.Node;
    } else {
        nodeType = SceneJS_NodeFactory.nodeTypes[json.type];
    }
    if (nodeType) {
        return this._createNode(nodeType, engine, json, core, ok);
    } else {
        var self = this;
        this.getType(json.type,
            function (nodeType) {
                self._createNode(nodeType, engine, json, core, ok);
            });
    }
};

SceneJS_NodeFactory.prototype._createNode = function (nodeType, engine, json, core, ok) {
    var node = new nodeType();
    var id = json.id || json.nodeId; // 'id' and 'nodeId' are aliases
    if (id) {
        this.nodes.addItem(id, node);
    } else {
        id = this.nodes.addItem(node);
    }
    node._construct(engine, core, json, id); // Instantiate node
    if (ok) {
        ok(node);
    }
    return node;
};

/**
 * Returns installed type of given type and ID
 */
SceneJS_NodeFactory.prototype.getType = function (typeName, ok) {
    var type = SceneJS_NodeFactory.nodeTypes[typeName];
    if (type) {
        ok(type);
        return;
    }
    var subs = this._subs[typeName] || (this._subs[typeName] = []);
    subs.push(ok);
    if (subs.length > 1) { // Not first sub
        return;
    }
    var self = this;
    var typePath = SceneJS_debugModule.configs.pluginPath;
    if (!typePath) {
        throw "no typePath config"; // Build script error - should create this config
    }
    this._loadScript(typePath + "/node/" + typeName + ".js",
        function () {
            var type = SceneJS_NodeFactory.nodeTypes[typeName]; // Type has installed itself
            if (!type) {
                throw "Node type plugin did not install itself correctly";
            }
            while (subs.length > 0) {
                subs.pop()(type);
            }
            delete subs[typeName];
        });
};

SceneJS_NodeFactory.prototype._loadScript = function (url, ok) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {  //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" ||
                script.readyState == "complete") {
                script.onreadystatechange = null;
                ok();
            }
        };
    } else {  //Others
        script.onload = function () {
            ok();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
};

/**
 * Releases a node back to this factory
 */
SceneJS_NodeFactory.prototype.putNode = function (node) {
    this.nodes.removeItem(node.id);
};
