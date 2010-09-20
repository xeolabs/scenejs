/**
 * @class A scene node that enables/ disables highlighting for the nodes in its sub graph.
 *
 * <p>This node just switches highlinghting on or off for its subgraph - it's up to the sub-nodes to determine
 * their highlighting behaviours.</p>
 *
 * <p>See {@link SceneJS.Material} for how that node behaves when highlighted.</p>
 *
 * <p><b>Example Usage</b></p><p>Definition of highlight:</b></p><pre><code>
 * var highlight = new SceneJS.Highlight({
 *          highlighted: true
 *     },
 *     // ... child nodes, highlighting in their own way
 * )
 * </pre></code>

 * @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Creates a new SceneJS.highlight
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Highlight = SceneJS.createNodeType("highlight");

// @private
SceneJS.Highlight.prototype._init = function(params) {
    this.setHighlighted(params.highlighted);
};

/**
 Sets whether highlight is highlighted or now. Default is highlighted.
 @function setHighlighted
 @param {boolean} highlighted
 @returns {SceneJS.Highlight} This highlight node
 @since Version 0.7.8
 */
SceneJS.Highlight.prototype.setHighlighted = function(highlighted) {
    this._highlighted = highlighted;
    this._setDirty();
    return this;
};

/**
 Returns whether this highlight node is highlighted or not
 @returns {boolean} Whether or not this highlight is highlighted
 @since Version 0.7.8
 */
SceneJS.Highlight.prototype.getHighlighted = function() {
    return this._highlighted;
};

// @private
SceneJS.Highlight.prototype._render = function(traversalContext) {
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {

        /* Don't need highlight for pick traversal
         */
        this._renderNodes(traversalContext);
    } else {
        SceneJS._highlightModule.pushHighlight({ highlighted: this._highlighted });
        this._renderNodes(traversalContext);
        SceneJS._highlightModule.popHighlight();
    }
};