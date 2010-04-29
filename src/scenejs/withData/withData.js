/**
 * @class SceneJS.WithData
 * @extends SceneJS.Node
 * <p>Scene node that creates a child data scope containing the elements of its configuration.</p><p>This node provides
 * a simple yet flexible mechanism for passing data down into a scene graph at runtime.</p>.
 * <p><b>Example:</b></p><p>Creating data for a child SceneJS.Scale node, which configures itself from the data
 * with a configuration function:</b></p><pre><code>
 *
 * var wd new SceneJS.WithData({
 *         sizeX: 5,
 *         sizeY: 10,
 *         sizeZ: 2
 *      },
 *      new SceneJS.translate({ x: 100 },
 *
 *          new SceneJS.scale(function(data) {        // Function in this case, instead of a config object
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
    this._data = {};
    this._childData = {};
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._utils.inherit(SceneJS.WithData, SceneJS.Node);

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
        this._childData = SceneJS._utils.newScope(data, this._fixedParams);
        for (var key in this._data) {
            this._childData.put(key, this._data[key]);
        }
        if (this._memoLevel == 1 && data.isfixed()) {
            this._memoLevel = 2;
        }
    }
    this._renderNodes(traversalContext, this._childData);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.withData = function() {
    var n = new SceneJS.WithData();
    SceneJS.WithData.prototype.constructor.apply(n, arguments);
    return n;
};