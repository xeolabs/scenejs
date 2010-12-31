/**
 * @class A scene branch node that selects which among its children are currently active.
 *
 * <p>This node is useful for dynamically controlling traversal within a scene graph.</p>

 * <p><b>Example Usage 1</b></p><p>This selector will allow only child nodes at indices 0 and 2 to be rendered,
 * which are the teapot and sphere. Child 1, a cube, is not selected and therefore won't be rendered.</p><pre><code>
 * var s = new SceneJS.Selector({ selection: [0, 2]},
 *
 *      new SceneJS.teapot(),   // Child 0
 *
 *      new SceneJS.cube(),     // Child 1
 *
 *      new SceneJS.sphere())   // Child 2
 *
 * s.setSelection([0,1,2]);  // Select all three child nodes
 *
 * </pre></code>
 * <p><b>Example Usage 2</b></p><p>A more advanced example - the selector in this example switches between three
 * viewpoints of the scene content. The content is instanced within each child of the Selector using Instance and Node
 * nodes. </p><pre><code>
 * var myScene = new SceneJS.Scene({ ... },
 *
 *       new SceneJS.Node({ name: "theScene" },
 *           new SceneJS.Teapot()
 *       ),
 *
 *       new SceneJS.Selector(
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
 * // Render scene for first viewpoint
 *
 * selector.setSelection([ 0 ]);
 * myScene.render();
 *
 * // Once more for second viewpoint
 *
 * selector.setSelection([ 1 ]);
 * myScene.render();
 *
 * </pre></code>
 *
 *
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Selector
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Selector = SceneJS.createNodeType("selector");

// @private
SceneJS.Selector.prototype._init = function(params) {
    this.setSelection(params.selection);
};

/**
 Sets the indices of selected children. When the value is undefined or an empty array, then no children will be selected.
 @function setSelection
 @param {int []} selection
 @returns {SceneJS.Selector} This Selector node
 */
SceneJS.Selector.prototype.setSelection = function(selection) {
    this._attr.selection = selection || [];
    this._setDirty();
    return this;
};

/**
 * Returns the indices of the selected child. The result will be an empty array if none are currently selected.
 * @function {int []} getSelection
 * @returns {int []} Array containing indices of selected children.
 */
SceneJS.Selector.prototype.getSelection = function() {
    var selection = new Array(this._attr.selection.length);
    for (var i = 0; i < this._attr.selection.length; i++) {
        selection[i] = this._attr.selection[i];
    }
    return selection;
};

// @private
SceneJS.Selector.prototype._render = function(traversalContext) {
    if (this._attr.selection.length > 0) {
        var children = [];
        for (var i = 0, len = this._attr.selection.length; i < len; i++) {
            var j = this._attr.selection[i];
            if (0 <= j && j < this._children.length) {
                children.push(this._children[j]);
            }
        }
        this._renderNodes(traversalContext, children);
    }
};
