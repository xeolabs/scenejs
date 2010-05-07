/**
 * @class A scene node that marks its subgraph as a "symbol" which can be then instanced with SceneJS.Instance nodes.
 *
 * <p>This node type is useful for keeping scene size small, while also simplifying editing of a scene; when you edit
 * content within a Symbol, all instances of the Symbol update to reflect the edits.</p>
 *
 * <p>When rendered, SceneJS registers this node against its specified name and prevents SceneJS from traversing
 * into its subgraph. The content defined within the Symbol will therefore only be rendered when it is instanced.
 * The registered name will be actually be the concatenation of the specified name with the namespace formed by
 * any enclosing SceneJS.Name nodes. When SceneJS then finds a SceneJS.Instance node that refers to the registered name,
 * it will instantiate the Symbol's child nodes as if they were children of the Instance node.</p>
 *
 * <p>Beware potential performance penalties for using Symbols and Instances. Within every subgraph, SceneJS
 * internally memoises whatever state it determines will not change between scene traversals. SceneJS may therefore be
 * restricted in what state it can memoise within a Symbol's subgraph when it is likely to be dynamically affected by
 * the different scene locations it which it is instanced.</p>
 *
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/9d8wLu">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Here we're defining a Symbol in a Name, then instantiating it three times with
 * Instance nodes to show variations on how an Instance node can refer to a Symbol, relative to a namespace
 * created by a Name node:</b></p><pre><code>
 * var scene = new SceneJS.Scene(
 *
 *      // ...
 *
 *      // Define a "teapot" symbol inside a namespace.
 *      // Note that the Name is not mandatory.
 *
 *      new SceneJS.Name({name: "mySymbols"},
 *
 *          new SceneJS.Symbol({ name: "teapot" },
 *              new SceneJS.objects.Teapot()
 *          ),
 *
 *          // Instance the teapot Symbol from inside the namespace.
 *          // See how the symbol reference is relative, where it
 *          // does not start with a '/'.
 *
 *          new SceneJS.Instance({name: "teapot" })
 *      ),
 *
 *      // Instance the teapot Symbol again, from outside the namespace
 *
 *      new SceneJS.Instance({name: "mySymbols/teapot"}),
 *
 *      // Instance the teapot Symbol one more time from outside the
 *      // namespace to show how an absolute path can be specified to
 *      // the Symbol
 *
 *      new SceneJS.Instance({name: "/mySymbols/teapot"})
 *
 *      // ...
 * );
 * </pre></code>
 *  @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Symbol
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Symbol = function() {
    SceneJS.Node.apply(this, arguments);
    this._name = "unnamed";
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Symbol, SceneJS.Node);

/**
 Sets the symbol name. When the given value is undefined, the name will default to "unnamed".
 @function setName
 @param {string} name
 @returns {SceneJS.Symbol} This symbol node
 */
SceneJS.Symbol.prototype.setName = function(name) {
    this._name = name || "unnamed";
    return this;
};

/**
 * Returns the symbol name. The name will be "unnamed" if none is specified.
 * @function {string} getName
 * @returns {string} The symbol name
 */
SceneJS.Symbol.prototype.getName = function() {
    return this._name;
};

// @private
SceneJS.Symbol.prototype._init = function(params) {
    if (params.name) {
        this.setName(params.name);
    }
};

// @private
SceneJS.Symbol.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    SceneJS_instancingModule.createSymbol(this._name, this);
};

/** Returns a new SceneJS.Symbol symbol
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Symbol constructor
 * @returns {SceneJS.Symbol}
 */
SceneJS.symbol = function() {
    var n = new SceneJS.Symbol();
    SceneJS.Symbol.prototype.constructor.apply(n, arguments);
    return n;
};
