/**
 * @class A scene node that specifies values to set on nodes in it's subgraph as they are rendered .
 * <p>This node provides a simple yet flexible mechanism for pushing data down during scene traversal
 * into the setter methods of the nodes in its subgraph.</p>.
 * <p>The configuration for a {@link SceneJS.WithConfigs} is a hierarchical map of values for the setter methods of
 * nodes in the subgraph. As shown in the example below, its hierarchy maps to that of the subgraph. The keys beginning
 * with "#" map to the SIDs of nodes, while other keys map to setter methods on those nodes. </p>.
 *
 * <p><b>Example:</b></p><p>Configuring {@link SceneJS.Translation} and {@link SceneJS.Scale} nodes in the subgraph:</b></p><pre><code>
 * var wd = new SceneJS.WithConfigs({
 *
 *         "#myTranslate" : {    // Selects the SceneJS.Scale
 *              x: 5,            // Invokes the setX, setY and setZ methods of the SceneJS.Translate
 *              y: 10,
 *              z: 2,
 *
 *              "#myScale" : {   // Selects the SceneJS.Scale
 *                  x: 2.0,      // Invokes the setX and setY methods of the SceneJS.Scale
 *                  z: 1.5
 *               }
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
 *                new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 *
 * </code></pre>
 * @extends SceneJS.Node
 * @since Version 0.7.6
 * @constructor
 * Create a new SceneJS.WithConfigs
 * @param {Object} [cfg] Static configuration object containing hierarchical map of values for sub-nodes
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function returning the hierarchical map
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.WithConfigs = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "with-configs";
    this._configs = {};
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.WithConfigs, SceneJS.Node);

/**
 Sets the configs map
 @param {Object} configs The configs map
 @returns {SceneJS.WithConfigs} this
 */
SceneJS.WithConfigs.prototype.setConfigs = function(configs) {
    this._configs = configs;
    this._memoLevel = 0;
    return this;
};

/**
 * Returns the configs map
 *
 * @returns {Object} The configs map
 */
SceneJS.WithConfigs.prototype.getConfigs = function() {
    return this._configs;
};

SceneJS.WithConfigs.prototype._init = function(params) {
    this._configs = params;
};

SceneJS.WithConfigs.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    if (this._memoLevel < 2) {
        if (this._memoLevel == 1 && data.isFixed() && !SceneJS_instancingModule.instancing()) {
            this._memoLevel = 2;
        }
    }
    traversalContext = {
        appendix : traversalContext.appendix,
        insideRightFringe: this._children.length > 1,
        configs : this._configs
    };
    this._renderNodes(traversalContext, new SceneJS.Data(data, this._fixedParams, this._data));
};

/**
 * Factory function that returns a new {@link SceneJS.WithConfigs} instance
 * @param {Object} [cfg] Static config map object
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function returning the config map
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.WithConfigs}
 * @since Version 0.7.6
 */
SceneJS.withConfigs = function() {
    var n = new SceneJS.WithConfigs();
    SceneJS.WithConfigs.prototype.constructor.apply(n, arguments);
    return n;
};