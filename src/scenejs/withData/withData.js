/**
 * @class A scene node that creates data in a scope for its subgraph.
 * @extends SceneJS.Node
 * <p>This node provides a simple yet flexible mechanism for passing data down into a scene graph at runtime, analogous to
 * creation of a closure's data scope in JavaScript .</p>.
 * <p>The data scope is implemented by a SceneJS.Data instance. On each render a SceneJS.Scene creates a global
 * SceneJS.Data populated with any properties that were given to the SceneJS.Scene's render method. That Data forms a
 * chain on which SceneJS.With nodes will push and pop as they are visited and departed from during scene traversal.</p>
 * <p>When some node, or node config callback, looks for a property on its local SceneJS.Data, it will hunt up the chain
 * to get the first occurance of that property it finds.</p>
 * <p><b>Example:</b></p><p>Creating data for a child SceneJS.Scale node, which has a callback to configure itself from
 * the data:</b></p><pre><code>
 * var wd = new SceneJS.WithData({
 *         sizeX: 5,
 *         sizeY: 10,
 *         sizeZ: 2
 *      },
 *      new SceneJS.Translate({ x: 100 },
 *
 *          new SceneJS.Scale(function(data) {        // Function in this case, instead of a config object
 *                   return {
 *                       x: data.get("sizeX"),
 *                       y: data.get("sizeY"),
 *                       z: data.get("sizeZ")
 *                   }
 *          },
 *
 *              new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 *
 * </code></pre>
 * @constructor
 * Create a new SceneJS.WithData
 * @param {Object} config The config object, followed by zero or more child nodes
 *
 */
SceneJS.WithData = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "withData";
    this._data = {};
    this._childData = {};
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.WithData, SceneJS.Node);

/**
 Sets a property
 @param {String} key Name of property
 @param {Object} value Value of property
 @returns {SceneJS.WithData} this
 */
SceneJS.WithData.prototype.setProperty = function(key, value) {
    this._data[key] = value;
    this._memoLevel = 0;
    return this;
};

/**
 * Returns the value of a property
 *
 * @param {String} key Name of property
 * @returns {Object} Value of property
 */
SceneJS.WithData.prototype.getProperty = function(key) {
    return this._data[key];
};


/** Clears all properties
 *@returns {SceneJS.WithData} this
 */
SceneJS.WithData.prototype.clearProperties = function() {
    this._data = {};
    this._memoLevel = 0;
    return this;
};

SceneJS.WithData.prototype._init = function(params) {
    for (var key in params) {
        this._data[key] = params[key];
    }
};

SceneJS.WithData.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    if (this._memoLevel < 2) {
        if (this._memoLevel == 1 && data.isFixed()) {
            this._memoLevel = 2;
        }
    }
    this._renderNodes(traversalContext, new SceneJS.Data(data, this._fixedParams, this._data));
};

/** Function wrapper to support functional scene definition
 */
SceneJS.withData = function() {
    var n = new SceneJS.WithData();
    SceneJS.WithData.prototype.constructor.apply(n, arguments);
    return n;
};