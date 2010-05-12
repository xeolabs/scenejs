/**
 * @class A scene branch node that selects which among its children are currently active.
 *
 * <p>This node is useful for dynamically controlling traversal within a scene graph.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-teapot-select">Example 1 - Switching Geometry</a></li></ul>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-view-select">Example 2 - Switchable Viewpoint</a></li></ul>
 * <p><b>Example Usage 1</b></p><p>This selector will allow only child nodes at indices 0 and 2 to be rendered,
 * which are the teapot and sphere. Child 1, a cube, is not selected and therefore won't be rendered.</p><pre><code>
 * var s = new SceneJS.Selector({ selection: [0, 2]},
 *
 *      new SceneJS.objects.teapot(),   // Child 0
 *
 *      new SceneJS.objects.cube(),     // Child 1
 *
 *      new SceneJS.objects.sphere())   // Child 2
 *
 * s.setSelection([0,1,2]);  // Select all three child nodes
 *
 * </pre></code>
 * <p><b>Example Usage 2</b></p><p>A more advanced example - the selector in this example switches between three
 * viewpoints of the scene content. The content is instanced within each child of the Selector using Instance and Symbol
 * nodes. When we render the scene, we can pass in the selection.</p><pre><code>
 * var myScene = new SceneJS.Scene({ ... },
 *
 *       new SceneJS.symbol({ name: "theScene" },
 *           new SceneJS.objects.Teapot()
 *       ),
 *
 *       new SceneJS.Selector(
 *               function(data) {   // Child index as a dynamic config
 *                   return {
 *                       selection: [data.get("activeCamera")]  // Selection
 *                   };
 *               },
 *
 *           new SceneJS.LookAt({ eye : { z: 10.0 } },
 *                new SceneJS.Instance({ name: "theScene"})),
 *
 *           new SceneJS.LookAt({ eye : { x: 10.0 }},
 *                new SceneJS.Instance({ name: "theScene"})),
 *
 *           new SceneJS.LookAt({ eye : { x: -5.0, y: 5, z: 5 }},
 *                new SceneJS.Instance({ name: "theScene" })
 *           )
 *       )
 *   );
 *
 * myScene.render({ activeCamera: 0 });  // Render scene for first viewpoint
 * myScene.render({ activeCamera: 1 });  // Once more for second viewpoint
 *
 * </pre></code>
 *
 *
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Selector
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Selector = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "selector";
    this._selection = [];
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Selector, SceneJS.Node);

/**
 Sets the indices of selected children. When the value is undefined or an empty array, then no children will be selected.
 @function setSelection
 @param {int []} selection
 @returns {SceneJS.Selector} This Selector node
 */
SceneJS.Selector.prototype.setSelection = function(selection) {
    selection = selection || [];
    this._selection = selection;
    return this;
};

/**
 * Returns the indices of the selected child. The result will be an empty array if none are currently selected.
 * @function {int []} getSelection
 * @returns {int []} Array containing indices of selected children.
 */
SceneJS.Selector.prototype.getSelection = function() {
    var selection = new Array(this._selection.length);
    for (var i = 0; i < this._selection.length; i++) {
        selection[i] = this._selection[i];
    }
    return selection;
};

// @private
SceneJS.Selector.prototype._init = function(params) {
    if (params.selection) {
        this.setSelection(params.selection);
    }
};

// @private
SceneJS.Selector.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    if (this._selection.length) {
        var children = [];
        for (var i = 0; i < this._selection.length; i++) {
            var j = this._selection[i];
            if (0 <= j && j < this._children.length) {
                children.push(this._children[j]);
            }
        }
        this._renderNodes(traversalContext, data, children);
    }
};

/** Returns a new SceneJS.Selector Selector
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Selector constructor
 * @returns {SceneJS.Selector}
 */
SceneJS.selector = function() {
    var n = new SceneJS.Selector();
    SceneJS.Selector.prototype.constructor.apply(n, arguments);
    return n;
};