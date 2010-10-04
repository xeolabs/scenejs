/**
 * @class A scene node that binds the nodes in its sub graph to a Z-axis layer.

 * <p></p>
 *
 *
 * @extends SceneJS.Node
 * @since Version 0.7.8
 * @constructor
 * Creates a new SceneJS.Layer
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.name = "unnamed"] The layer name
 * @param {double} [cfg.index = 1.0] Z depth-sort index
 * @param {...SceneJS.Node} [nodes] Child nodes
 */
SceneJS.Layer = SceneJS.createNodeType("layer");

// @private
SceneJS.Layer.prototype._init = function(params) {
    this.setIndex(params.index);
};

/**
 Sets the layer index
 @function setIndex
 @param {Number} index - index
 @returns {SceneJS.Layer} This layer node
 @since Version 0.7.8
 */
SceneJS.Layer.prototype.setIndex = function(index) {
    this._index = index || 0;
    this._setDirty();
    return this;
};

/**
 Returns the layer index
 @function {Number} getIndex
 @returns {Number} Layer index
 @since Version 0.7.8
 */
SceneJS.Layer.prototype.getIndex = function() {
    return this._index;
};


// @private
SceneJS.Layer.prototype._render = function(traversalContext) {
    SceneJS._layerModule.pushLayer({
        index: this._index
    });
    this._renderNodes(traversalContext);
    SceneJS._layerModule.popLayer();
};