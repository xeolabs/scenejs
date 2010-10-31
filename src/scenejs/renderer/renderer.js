/** @class A scene node that sets WebGL state for nodes in its subtree.
 * <p>This node basically exposes various WebGL state configurations through the SceneJS API.</p>
 * (TODO: more comments here!)

 * @extends SceneJS.Node
 */
SceneJS.Renderer = SceneJS.createNodeType("renderer");


// @private
SceneJS.Renderer.prototype._init = function(params) {
    this._attr = {};
    if (params.blend) {
        this.setBlend(params.blend);
    }
    if (params.wireframe) {
        this.setBlend(params.wireframe);
    }
    if (params.highlight) {
        this.setBlend(params.highlight);
    }
};

SceneJS.Renderer.prototype.setBlend = function(blend) {
    this._props.blend = blend;
};

SceneJS.Renderer.prototype.getBlend = function() {
    return this._props.blend;
};

SceneJS.Renderer.prototype.setWireframe = function(wireframe) {
    this._props.wireframe = wireframe;
};

SceneJS.Renderer.prototype.getWireframe = function() {
    return this.props.wireframe;
};

SceneJS.Renderer.prototype.setHighlight = function(highlight) {
    this._props.highlight = highlight;
};

SceneJS.Renderer.prototype.getHighlight = function() {
    return this.props.highlight;
};

// @private
SceneJS.Renderer.prototype._render = function(traversalContext) {
    if (this._memoLevel == 0) {
        this._props = SceneJS._rendererModule.createProps(this._getParams());
        this._memoLevel = 1;
    }
    SceneJS._rendererModule.pushProps(this._props);
    this._renderNodes(traversalContext);
    SceneJS._rendererModule.popProps(this._props);
};