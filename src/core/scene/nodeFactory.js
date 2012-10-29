/**
 * @class Manages creation, recycle and destruction of {@link SceneJS.Node} instances
 * @private
 */
var SceneJS_NodeFactory = function() {

    this.nodes = new SceneJS_Map({});
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
 * @param {String} nodeTypeName Name of type, eg. "rotate"
 * @param {String} coreTypeName Optional name of core type for the node, eg. "xform" - defaults to type name of node
 * @returns The new node class
 */
SceneJS_NodeFactory.createNodeType = function(nodeTypeName, coreTypeName) {

    var nodeType = function() { // Create the class
        SceneJS.Node.apply(this, arguments);
        this.type = nodeTypeName;
    };

    nodeType.prototype = new SceneJS.Node();            // Inherit from base class
    nodeType.prototype.constructor = nodeType;

    SceneJS_NodeFactory.nodeTypes[nodeTypeName] = nodeType;

    return nodeType;
};

/**
 *
 */
SceneJS_NodeFactory.prototype.getNode = function(engine, json, core) {

    json.type = json.type || "node"; // Nodes are SceneJS.Node type by default

    var nodeType;

    if (json.type == "node") {

        nodeType = SceneJS.Node;

    } else {

        nodeType = SceneJS_NodeFactory.nodeTypes[json.type];

        if (!nodeType) {
            throw SceneJS_error.fatalError("node type not supported: '" + json.type + "'");
        }
    }

    var node = new nodeType();

    var id = json.id || json.nodeId; // 'id' and 'nodeId' are aliases

    if (id) {
        this.nodes.addItem(id, node);

    } else {
        id = this.nodes.addItem(node);
    }

    node._construct(engine, core, json, id); // Instantiate node

    return node;
};

/**
 * Releases a node back to this factory
 */
SceneJS_NodeFactory.prototype.putNode = function(node) {

    this.nodes.removeItem(node.id);
};
