/**
 * @class Invokes addXXX, removeXXX and setXXX methods on the nodes in its subgraph during traversal to set, delete or add
 * elements on them.</p>.
 * <p>The configuration for a {@link SceneJS.WithConfigs} is a hierarchical map of values for methods on
 * nodes in the subgraph. As shown in the examples below, its hierarchy maps to that of the subgraph. The keys beginning
 * with "#" map to the SIDs of nodes. In the first example, we have property keys that map to setter methods on
 * those nodes. In the second example we have a property key prefixed with "+", which maps it to a method beginning
 * with "add" (addNode). In the third example, we have a property key prefixed with "-", which maps it to a method
 * beginning with "remove" (removeNode).</p>
 *
 * <p>Note that configs are applied to nodes just before they are rendered, so as long as your config map
 * resolves correctly, the nodes don't have to have initial configurations wherever you have specified them for "setXXX"
 * methods in the config map.</p>
 *
 * <h2>Example 1: Setting properties on subnodes</h2>
 * <p><b>Example 1:</b></p><p>Configuring properties on {@link SceneJS.Translation} and {@link SceneJS.Scale} nodes in the subgraph:</b></p><pre><code>
 * var wc = new SceneJS.WithConfigs({
 *
 *         // Optionally you can specify that the configs map is to be forgotten as soon as it is used,
 *         // where the WithConfigs node only applies it the first time it is rendered, before clearing it.
 *         // In this case, our WithConfigs applies it every time:
 *
 *         once : false,
 *
 *         configs: {
 *             "#myTranslate" : {    // Selects the SceneJS.Scale
 *                  x: 5,            // Invokes the setX, setY and setZ methods of the SceneJS.Translate
 *                  y: 10,
 *                  z: 2,
 *
 *                  "#myScale" : {   // Selects the SceneJS.Scale
 *                      x: 2.0,      // Invokes the setX and setY methods of the SceneJS.Scale
 *                      z: 1.5
 *                   }
 *             }
 *          }
 *      },
 *
 *      new SceneJS.Translate({
 *                     sid: "myTranslate",
 *                     x: 100,
 *                     y: 20,
 *                     z: 15
 *                  },
 *
 *          new SceneJS.Scale({
 *                        sid: "myScale",
 *                        x : 1.0
 *                     },
 *
 *                new SceneJS.Cube()
 *          )
 *      )
 *  )
 * </code></pre>
 *
 * <h2>Adding elements to subnodes</h2>
 * <p><b>Example:</b></p><p>In this example we're using a WithConfigs node to attach a subgraph to a target node
 * within it's own subgraph. Abstractly, a teapot is being attached to a chair at a table in a cafe. Note
 * the "+node" key in the map for the "chair2" node, which maps to the "addNode" method on that node.</b></p><pre><code>
 * var wc = SceneJS.withConfigs({
 *         configs: {
 *             "#cafe": {
 *                  "#table5" : {
 *                      "#chair2" : {
 *
 *                          // Content we're attaching. "+node" directs the WithConfig
 *                          // to call the "addNode" method on the Node at the attachment
 *                          // point to attach the object
 *                          //
 *                          "+node" :
 *                               SceneJS.rotate({ // The object to attach - imagine
 *                                         angle: 0,    // this teapot is a person!
 *                                         y : 1.0
 *                                    },
 *                                    SceneJS.teapot())
 *                               }
 *                          }
 *                      }
 *                  }
 *             },
 *             SceneJS.node({ sid: "cafe" },
 *                  SceneJS.translate({ x: -1, y: 0, z: -1},
 *                      SceneJS.node({ sid: "table5" },
 *                          SceneJS.translate({ x: 1, y: 0, z: 1},
 *
 *                             // Attachment point
 *
 *                             SceneJS.node({ sid: "chair2" }))))))
 * </code></pre>
 *
 * <h2>Removing elements from subnodes</h2>
 * <p><b>Example:</b></p><p>In this example we're using a WithConfigs node to delete a subgraph from a target node.
 * Abstractly, a chair is being removed from a table in a cafe. Note the "-node" key in the map for the "chair2" node,
 * which maps to the "removeNode" method on that node, and the value, which is the SID of the node to remove.</b></p><pre><code>
 * var wc = SceneJS.withConfigs({
 *         configs: {
 *             "#cafe": {
 *                  "#table5" : {
 *
 *                      // Content we're removing. "-node" directs the WithConfig
 *                      // to call the "removeNode" method on the "table5" target Node
 *                      //
 *                      "-node" : "#chair2"
 *                  }
 *             },
 *             SceneJS.node({ sid: "cafe" },
 *                  SceneJS.translate({ x: -1, y: 0, z: -1},
 *
 *                      // Target node
 *
 *                      SceneJS.node({ sid: "table5" },
 *                          SceneJS.translate({ x: 1, y: 0, z: 1},
 *
 *                             // Removing this subnode:
 *
 *                             SceneJS.node({ sid: "chair2" }))))))
 * </code></pre>
 * @extends SceneJS.Node
 * @since Version 0.7.6
 * @constructor
 * Create a new SceneJS.WithConfigs
 * @param {Object} [cfg] Static configuration object containing hierarchical map of values for sub-nodes
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.WithConfigs = SceneJS.createNodeType("withConfigs");

SceneJS.WithConfigs.prototype._init = function(params) {
    this.setConfigs(params.configs);
    this._once = params.once != undefined ? params.once : false;
};

/**
 Sets the configs map
 @param {Object} configs The configs map
 @returns {SceneJS.WithConfigs} this
 */
SceneJS.WithConfigs.prototype.setConfigs = function(configs, once) {
    this._childConfigs = configs || {}; // Lazy pre-process on render in case set repeatedly
    if (once != undefined) {
        this._once = once;
    }
    this._setDirty();
    return this;
};

/**
 * Returns the configs map
 *
 * @returns {Object} The configs map
 */
SceneJS.WithConfigs.prototype.getConfigs = function() {
    return this._childConfigs;
};

/**
 Sets whether the configs map is forgotten as soon as the node has rendered, ie. to apply only once.
 @param {boolean} once - Will forget when this is true
 @returns {SceneJS.WithConfigs} this
 */
SceneJS.WithConfigs.prototype.setOnce = function(once) {
    this._once = once;
    if (once != undefined) {
        this._once = once;
    }
    this._setDirty();
    return this;
};

/**
 * Sets whether the configs map is forgotten as soon as the node has rendered, ie. to apply only once.
 *
 * @returns {boolean} True if to forget, else false
 */
SceneJS.WithConfigs.prototype.getOnce = function() {
    return this._once;
};

SceneJS.WithConfigs.prototype._render = function(traversalContext) {
    if (this._memoLevel == 0) {
        this._childConfigs = SceneJS._preprocessConfigs(this._childConfigs);
        this._memoLevel = 1;
    }

    //    if (this._memoLevel < 2) {
    //        if (this._memoLevel == 1 && data.isFixed() && !SceneJS._instancingModule.instancing()) {
    //            this._memoLevel = 2;
    //        }
    //    }
    traversalContext = {
        insideRightFringe: this._children.length > 1,
        callback : traversalContext.callback,
        configs : this._childConfigs
    };
    // this._renderNodes(traversalContext, new SceneJS.Data(data, this._fixedParams, this._data));
    this._renderNodes(traversalContext);

    if (this._once) {
        this._childConfigs = {};
    }
};