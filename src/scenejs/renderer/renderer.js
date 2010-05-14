/** @class A scene node that sets WebGL state for nodes in its subtree.
 * <p>This node basically exposes various WebGL state configurations through the SceneJS API.</p>
 * (TODO: more comments here!)
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-renderer-node">Example 1</a></li>
 * </ul>
 * @extends SceneJS.Node
 */
SceneJS.Renderer = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "renderer";
    this._params = this._getParams();
    this._sceneId = null; // lazy-set on render
    this._lastRenderedData = null;
};

SceneJS._inherit(SceneJS.Renderer, SceneJS.Node);

// @private
SceneJS.Renderer.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {  // One-shot dynamic config               
        this._rendererState = SceneJS_rendererModule.createRendererState(this._getParams(data));
        if (this._fixedParams) {
            this._memoLevel = 1;
        }
    }
    SceneJS_rendererModule.setRendererState(this._rendererState);
    this._renderNodes(traversalContext, data);
    SceneJS_rendererModule.undoRendererState(this._rendererState);
};

/** Returns a new SceneJS.Renderer instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Renderer constructor
 * @returns {SceneJS.Renderer}
 */
SceneJS.renderer = function() {
    var n = new SceneJS.Renderer();
    SceneJS.Renderer.prototype.constructor.apply(n, arguments);
    return n;
};