/**
 *  @class SceneJS.Generator
 *  @extends SceneJS.Node
 *
 *  <p>Scene node that loops over its children, each time creating a child data scope for them from the result of its
 *  configuration function, repeating this process until the config function returns nothing.</p>
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
 *  </pre></code> 
 * @constructor
 * Create a new SceneJS.Generator
 * @param {Object} func  Config function, followed by one or more child nodes
 */

SceneJS.Generator = function(cfg) {
    SceneJS.Node.apply(this, arguments);
};

SceneJS._utils.inherit(SceneJS.Generator, SceneJS.Node);

SceneJS.Generator.prototype._render = function(traversalContext, data) {
    if (this._fixedParams) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.InvalidNodeConfigException
                        ("SceneJS.Generator may only be configured with a function"));
    }
    var params = this._getParams(data);
    while (params) {
        var childData = SceneJS._utils.newScope(data);
        for (var key in params) {
            childData.put(key, params[key]);
        }
        this._renderNodes(traversalContext, childData);
        params = this._getParams(data);
    }
};

/** Function wrapper to support functional scene definition
 */
SceneJS.generator = function() {
    var n = new SceneJS.Generator();
    SceneJS.Generator.prototype.constructor.apply(n, arguments);
    return n;
};