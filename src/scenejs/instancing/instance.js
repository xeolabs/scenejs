/**
 * @class A scene node that instantiates a previously-defined SceneJS.Symbol node.
 *
 * <p>When rendered, a {@link SceneJS.Symbol} node registers its contents against a specified name, without rendering the
 * content. Then when SceneJS then finds a {@link SceneJS.Instance} node that refers to the registered name,
 * it will instantiate the Symbol's child nodes as if they were children of the Instance node.</p>
 *
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/9d8wLu">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Here we're defining a Symbol in a Name, then instantiating it three times with
 * {@link SceneJS.Instance} nodes to show variations on how an Instance node can refer to a Symbol, relative to a namespace
 * created by a {@link SceneJS.Name} node:</b></p><pre><code>
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
 * Create a new SceneJS.Instance
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Instance = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "instance";
    this._name = null;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Instance, SceneJS.Node);

/**
 Sets the name of the symbol to instance. The name will be "unnamed" if none is specified.
 @function setName
 @param {string} name
 @returns {SceneJS.Instance} This instance node
 */
SceneJS.Instance.prototype.setName = function(name) {
    this._name = name || "unnamed";
    return this;
};

/**
 Returns the name of the instanced symbol. The name will be "unnamed" if none is specified.
 @function {string} getName
 @returns {string} The name
 */
SceneJS.Instance.prototype.getName = function() {
    return this._name;
};

// @private
SceneJS.Instance.prototype._init = function(params) {
    if (params.name) {
        this.setName(params.name);
    }
};

// @private
SceneJS.Instance.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    var nameNode = SceneJS_instancingModule.acquireInstance(this._name);
    if (!nameNode) {
        SceneJS_errorModule.fatalError(
                new SceneJS.SymbolNotFoundException
                        ("SceneJS.Instance could not find SceneJS.Symbol to instance: '" + this._name + "'"));
    } else {
        nameNode._renderNodes(traversalContext, data);
        SceneJS_instancingModule.releaseInstance();
    }
};

/** Returns a new SceneJS.Instance instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Instance constructor
 * @returns {SceneJS.Instance}
 */
SceneJS.instance = function() {
    var n = new SceneJS.Instance();
    SceneJS.Instance.prototype.constructor.apply(n, arguments);
    return n;
};
