/**
 * @class A scene node that marks its subgraph as a "symbol" which can be then instanced with {@link SceneJS.Instance} nodes.
 *
 * <p>This node type is useful for keeping scene size small, while also simplifying editing of a scene; when you edit
 * content within a Symbol, all instances of the Symbol update to reflect the edits.</p>
 *
 * <p>When rendered, SceneJS registers this node against its sub-identifier (SID) and prevents SceneJS from traversing
 * into its subgraph. The content defined within the Symbol will therefore only be rendered when it is instanced.
 * The registered identity will be actually be the concatenation of the SID with the namespace formed by the SIDs
 * any enclosing nodes. When SceneJS then finds a {@link SceneJS.Instance} node with a URL that refers to the
 * registered identity, it will instantiate the Symbol's child nodes as if they were children of the {@link SceneJS.Instance}
 *  node.</p>
 *
 * <p>Beware potential performance penalties for using Symbols and {@link SceneJS.Instances}. Within every subgraph, SceneJS
 * internally memoises whatever state it determines will not change between scene traversals. SceneJS may therefore be
 * restricted in what state it can memoise within a Symbol's subgraph when it is likely to be dynamically affected by
 * the different scene locations it which it is instanced.</p>
 *
 
 * <p><b>Example Usage</b></p><p>Here we're defining a Symbol in a {@link SceneJS.Node}, then instantiating it three times with
 * {@link SceneJS.Instance} nodes to show variations on how an {@link SceneJS.Instance} node can refer to a Symbol, relative to
 * a namespace created by a {@link SceneJS.Node}:</b></p><pre><code>
 * var scene = new SceneJS.Scene(
 *
 *      // ...
 *
 *      // Define a "teapot" symbol inside a namespace.
 *
 *      new SceneJS.Node({ sid: "mySymbols"},
 *
 *          new SceneJS.Symbol({ sid: "teapot" },
 *              new SceneJS.objects.Teapot()
 *          ),
 *
 *          // Instance the teapot Symbol from inside the namespace.
 *          // See how the symbol reference is relative, where it
 *          // does not start with a '/'.
 *
 *          new SceneJS.Instance({ uri: "teapot" })
 *      ),
 *
 *      // Instance the teapot Symbol again, from outside the namespace
 *
 *      new SceneJS.Instance({ uri: "mySymbols/teapot"}),
 *
 *      // Instance the teapot Symbol one more time from outside the
 *      // namespace to show how an absolute path can be specified to
 *      // the Symbol
 *
 *      new SceneJS.Instance({ uri: "/mySymbols/teapot" })
 *
 *      // ...
 * );
 * </pre></code>
 *  @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Symbol
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.name="unnamed"]
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Instance}
 */
SceneJS.Symbol = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "symbol";
};

SceneJS._inherit(SceneJS.Symbol, SceneJS.Node);

// @private
SceneJS.Symbol.prototype._render = function(traversalContext, data) {
    if (!this._sid) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.NodeConfigExpectedException
                ("SceneJS.Symbol parameter expected: sid"));
    }
    this._sidPath = SceneJS._instancingModule.getName();  // Path to this Symbol, without this Symbol's SID
    SceneJS._instancingModule.createSymbol(this._sid, this);
};


/**  Factory function that returns a new {@link SceneJS.Symbol}
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.name="unnamed"]
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @returns {SceneJS.Symbol}
 * @since Version 0.7.4
 */
SceneJS.symbol = function() {
    var n = new SceneJS.Symbol();
    SceneJS.Symbol.prototype.constructor.apply(n, arguments);
    return n;
};
