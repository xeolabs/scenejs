/**
 * @class A scene node that binds the nodes in its sub graph to a named layer.

 * <p></p>
 *
 *
 * @extends SceneJS.Node
 * @since Version 0.7.8
 * @constructor
 * Creates a new SceneJS.Layer
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.name = "unnamed"] The layer name
 * @param {...SceneJS.Node} [nodes] Child nodes
 */
SceneJS.Layer = SceneJS.createNodeType("layer");

// @private
SceneJS.Layer.prototype._init = function(params) {
    this.setName(params.name);
};

/**
 Sets the layer name
 @function setIndex
 @param {String} name - name
 @returns {SceneJS.Layer} This layer node
 @since Version 0.7.8
 */
SceneJS.Layer.prototype.setName = function(name) {
    this._name = name || 0;
    this._setDirty();
    return this;
};

/**
 Returns the layer name
 @function {String} getName
 @returns {String} Layer name
 @since Version 0.7.8
 */
SceneJS.Layer.prototype.getName = function() {
    return this._name;
};


// @private
SceneJS.Layer.prototype._render = function(traversalContext) {
    this._renderNodes(traversalContext);
};