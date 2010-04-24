/**
 * @class SceneJS.withData
 * @extends SceneJS.node
 * <p>Scene node that creates a child data scope containing the elements of its configuration.</p><p>This node provides
 * a simple yet flexible mechanism for passing data down into a scene graph at runtime.</p>.
 * <p><b>Example 1 (functionally composed style):</b></p><p>Creating data for a child SceneJS.scale node, which configures itself from the data
 * with a configuration function:</b></p><pre><code>
 *
 *  SceneJS.withData({
 *         sizeX: 5,
 *         sizeY: 10,
 *         sizeZ: 2
 *      },
 *      SceneJS.translate({ x: 100 },
 *
 *          SceneJS.scale(function(data) {        // Function in this case, instead of a config object
 *                   return {
 *                       x: data.get("sizeX"),
 *                       y: data.get("sizeY"),
 *                       z: data.get("sizeZ")
 *                   }
 *          },
 *
 *              SceneJS.objects.cube()
 *          )
 *      )
 *  )
 *
 *</code></pre>
 * <p><b>Example 2 (object composition style):</b></p><pre><code>
 *
 *  var wd = SceneJS.withData({
 *         sizeX: 5,
 *         sizeY: 10
 *      });
 *
 *  wd.setProperty("sizeZ", 2);
 *
 *  var t = SceneJS.translate({ x: 100 });
 *
 *  var s = SceneJS.scale(function(data) {        // Config function receives data
 *           return {
 *              x: data.get("sizeX"),
 *              y: data.get("sizeY"),
 *              z: data.get("sizeZ")
 *          };
 *     });
 *
 *  var c = SceneJS.objects.cube();
 *
 *  wd.addChild(t);
 *  t.addChild(s);
 *  s.addChild(c);
 *
 * </code></pre>
 *  <p><b>Example 3 (functionally composed style):</b></p><p>SceneJS.withData nodes can be nested. This example
 * does the same thing as the previous two, but in this case splits the data into two nested scopes. At runtime, the
 * scale node will do a little bit more work to get it's x and y properties here, where it will have to hunt one level
 * up data scope chain to get them.</b></p><pre><code>
 *
 *  SceneJS.withData({                                // Creates data scope, A
 *         sizeX: 5,
 *         sizeY: 10
 *      },
 *
 *      SceneJS.translate({ x: 100 },
 *
 *          SceneJS.withData({                        // Creates nested data scope, B
 *             sizeY: 10
 *          },
 *
 *              SceneJS.scale(function(data) {
 *                       return {
 *                           x: data.get("sizeX"),    // Finds data on scope A
 *                           y: data.get("sizeY"),    // Finds data on scope A
 *                           z: data.get("sizeZ")     // Finds data on scope B
 *                       }
 *                  },
 *
 *                  SceneJS.objects.cube()
 *              )
 *          )
 *      )
 *  )
 *
 *</code></pre>
 * @constructor
 * Create a new SceneJS.withData
 * @param {Object} The config object, followed by zero or more child nodes
 *
 */
SceneJS.withData = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {
        var _data = {};
        var _childData;

        $.setProperty = function(key, value) {
            _data[key] = value;
            $._memoLevel = 0;
            return $;
        };

        $.getProperty = function(key) {
            return data[key];
        };

        $.clearProperties = function() {
            _data = {};
            $._memoLevel = 0;
            return $;
        };

        function init(params) {
            for (var key in params) {
                _data[key] = params[key];
            }
        }

        if (cfg.fixed) {
            init(cfg.getParams());
        }

        $._render = function(traversalContext, data) {
            if ($._memoLevel == 0) {
                if (!cfg.fixed) {
                    init(cfg.getParams(data));
                } else {
                    $._memoLevel = 1;
                }
            }
            if ($._memoLevel < 2) {
                _childData = SceneJS._utils.newScope(data, cfg.fixed);
                for (var key in _data) {
                    _childData.put(key, _data[key]);
                }
                if ($._memoLevel == 1 && data.isfixed()) {
                    $._memoLevel = 2;
                }
            }
            $._renderChildren(traversalContext, _childData);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
