/**
 *  @class A scene node that performs procedural scene generation by causing its child nodes to be rendered multiple times
 * in a loop within a scene traversal, while varying the data available to them in each loop.
 *
 *  <p>Each time a SceneJS.Generator loops over its children it creates a child data scope for them from the result of its
 *  configuration callback function, then repeats the process as long as the function returns something.</p>
 *
 *  <p>This node type must be configured dynamically therefore, in the SceneJS style, with a configuration function.</p>
 *
 *  <p>This node type is useful for procedurally generating scene subtrees. Its most common application would be
 *  to dynamically instance elements of primitive geometry to build complex objects.</p>
 *
 *  <p>Note that generator nodes can have a negative impact on performance, where they will often prevent subnodes from
 *  employing memoization strategies that fast scene graphs often depend upon. Use them carefully when high performance
 *  is desired in large scenes. The impact will depend on the type of subnode that receives the generated data.
 *  For example, inability to memoize will cascade downwards through  modelling transform node hierarchies since they
 *  will have to re-multiply matrices by dynamic parent modelling transforms etc.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/c9ySdG">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Below is a SceneJS.Generator that loops over its subgraph to create a ring of cubes, 45 degrees apart.</b></p><pre><code>
 * var g = new SceneJS.Generator(
 *        (function() {                        // Higher order function tracks the angle in closure
 *            var angle = 0;
 *            return function() {              // Generator function
 *                angle += 45.0;
 *                if (angle <= 360.0) {
 *                    return { angle: angle }; // Angle still less than 360, return config object
 *                } else {  // Reset the generator
 *                    angle = 0;               // Angle at max, reset and return nothing,
 *                }                            // causing loop to finish for this frame
 *            };
 *        })(),
 *
 *        new SceneJS.Rotate(function(data) {
 *            return { angle : data.get("angle"), y: 1.0 };
 *        },
 *                new SceneJS.Translate(function(data) {
 *                    return { x: 10.0 };
 *                },
 *
 *                new SceneJS.objects.cube()
 *            )
 *         )
 *   );
 * </pre></code>
 * @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Generator
 * @param {Object} [cfg] Static configuration object
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Generator = function(cfg) {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "generator";
};

SceneJS._inherit(SceneJS.Generator, SceneJS.Node);

// @private
SceneJS.Generator.prototype._render = function(traversalContext, data) {
    if (this._fixedParams) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException
                        ("SceneJS.Generator may only be configured with a function"));
    }
    var params = this._getParams(data);
    while (params) {
        this._renderNodes(traversalContext, new SceneJS.Data(data, false, params));
        params = this._getParams(data);
    }
};

/** Factory function that returns a new {@link SceneJS.Generator} instance
 * @param {Object} [cfg] Static configuration object
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Generator}
 *  @since Version 0.7.2
 */
SceneJS.generator = function() {
    var n = new SceneJS.Generator();
    SceneJS.Generator.prototype.constructor.apply(n, arguments);
    return n;
};