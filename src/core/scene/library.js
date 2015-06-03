/**
 * @class Scene graph node which assigns nodes in its subgraph to a library
 * @extends SceneJS.Node
 */
SceneJS.Library = SceneJS_NodeFactory.createNodeType("library");
SceneJS.Library.prototype._compile = function(ctx) { // Bypass child nodes
};

