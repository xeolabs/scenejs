/**
 *@class SceneJS.Name
 *@extends SceneJS.Node
 *<p>Scene node that specifies a name for the nodes in its subgraph. These may be nested to create hierarchical
 *names, effectively overlaying semantics onto a scene</p>.
 *<p><b>Example:</b></p><p>Two cubes, blue and green, assigned names "cubes.blue" and "cubes.green".</b></p><pre><code>
 * var n = SceneJS.Name({ name: "cubes" },
 *      new SceneJS.Name({ name: "blue" },
 *              new SceneJS.Material({
 *                  baseColor: { b: 0.9 }
 *              },
 *                      new SceneJS.Translate({x: -10.0 },
 *                              new SceneJS.objects.Cube()
 *                              )
 *                      )
 *              ),
 *
 *      new SceneJS.Name({ name: "green" },
 *              new SceneJS.Material({
 *                  baseColor: { g: 0.9 }
 *              },
 *                      new SceneJS.Translate({x: 10.0 },
 *                              new SceneJS.objects.Cube()
 *                              )
 *                      )
 *              )
 *      )
 *  // ...
 * </code></pre>
 *  @constructor
 Create a new SceneJS.Name
 @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Name = function() {
    this._name = "undefined";
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._utils.inherit(SceneJS.Name, SceneJS.Node);

/**
 * Sets the name value
 * @param {String} name The name value
 * @returns {SceneJS.Name} This name node
 */
SceneJS.Name.prototype.setName = function(name) {
    if (!name) {
        SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.name name is undefined"));
    }
    name = name.replace(/^\s+|\s+$/g, ''); // Trim
    if (name.length == 0) {
        SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.name name cannot be empty string"));
    }
    this._name = name;
    return this;
};

/** Returns the name value
 * @returns {String} The name string
 */
SceneJS.Name.prototype.getName = function() {
    return this._name;
};

SceneJS.Name.prototype._init = function(params) {
    if (params.name) {
        this.setName(params.name);
    }
};

SceneJS.Name.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    SceneJS_nameModule.pushName(this._name);
    this._renderNodes(traversalContext, data);
    SceneJS_nameModule.popName();
};

/** Function wrapper to support functional scene definition
 */
SceneJS.name = function() {
    var n = new SceneJS.Name();
    SceneJS.Name.prototype.constructor.apply(n, arguments);
    return n;
};
