/** @class A scene node that sets WebGL state for nodes in its subtree.
 * <p>This node basically exposes various WebGL state configurations through the SceneJS API.</p>
 * (TODO: more comments here!)

 * @extends SceneJS.Node
 */
SceneJS.Renderer = SceneJS.createNodeType("renderer");

// @private
SceneJS.Renderer.prototype._render = function(traversalContext) {
    if (this._memoLevel == 0) {
        this._rendererState = SceneJS._rendererModule.createRendererState(this._getParams());
        this._memoLevel = 1;
    }
    SceneJS._rendererModule.setRendererState(this._rendererState);
    this._renderNodes(traversalContext);
    SceneJS._rendererModule.undoRendererState(this._rendererState);
};