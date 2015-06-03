/**
 * @class Manages creation, recycle and destruction of {@link SceneJS.Node} instances
 * @private
 */
var SceneJS_NodeFactory = function () {

    /** Nodes created by this factory
     * @type {SceneJS_Map}
     */
    this.nodes = new SceneJS_Map({});
};

/**
 * Scene graph node classes provided by the SceneJS_NodeFactory class
 *
 * @type {[SceneJS.Node]}
 */
SceneJS_NodeFactory.nodeTypes = {};

/**
 * Subscribers waiting for node types
 * @type {Object}
 * @private
 */
SceneJS_NodeFactory._subs = {};

/**
 * Creates a node class for instantiation by this factory
 *
 * @param {String} typeName Name of type, eg. "rotate"
 * @param {String} coreTypeName Optional name of core type for the node, eg. "xform" - defaults to type name of node
 * @param {Function} [augment] Augments the basic node type with our custom node methods
 * @returns The new node class
 */
SceneJS_NodeFactory.createNodeType = function (typeName, coreTypeName, augment) {
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

    var type = SceneJS_NodeFactory.nodeTypes[typeName]; // Type has installed itself
    if (!type) {
        throw "Node type plugin did not install itself correctly";
    }
    // Augment the basic node type
    if (augment) {
        augment(nodeType);
    }
    // Notify subscribers waiting for the type
    var subs = SceneJS_NodeFactory._subs[typeName];
    if (subs) {
        while (subs.length > 0) {
            subs.pop()(type);
        }
        delete subs[typeName];
    }
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
        this._getType(
            engine,
            json.type,
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
SceneJS_NodeFactory.prototype._getType = function (engine, typeName, ok) {
    var type = SceneJS_NodeFactory.nodeTypes[typeName];
    if (type) {
        ok(type);
        return;
    }
    var subs = SceneJS_NodeFactory._subs[typeName] || (SceneJS_NodeFactory._subs[typeName] = []);
    subs.push(ok);
    if (subs.length > 1) { // Not first sub
        return;
    }
    var taskId = SceneJS_sceneStatusModule.taskStarted(engine.scene, "Loading plugin");
    subs.push(function () {
        SceneJS_sceneStatusModule.taskFinished(taskId);
    });
    var self = this;
    var typePath = SceneJS_configsModule.configs.pluginPath;
    if (!typePath) {
        throw "no typePath config"; // Build script error - should create this config
    }
    this._loadScript(typePath + "/node/" + typeName + ".js",
        function () {
            SceneJS_sceneStatusModule.taskFailed(taskId);
        });
};

SceneJS_NodeFactory.prototype._loadScript = function (url, error) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onerror = error;
    document.getElementsByTagName("head")[0].appendChild(script);
};

/**
 * Releases a node back to this factory
 */
SceneJS_NodeFactory.prototype.putNode = function (node) {
    this.nodes.removeItem(node.id);
};
