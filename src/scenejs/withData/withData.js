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
 *  var s = SceneJS.scale(function(data) {        // Function in this case, instead of a config object
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
 *  SceneJS.withData({
 *         sizeX: 5,
 *         sizeY: 10
 *      },
 *
 *          SceneJS.withData({
 *             sizeY: 10
 *          },
 *
 *          SceneJS.translate({ x: 100 },
 *
 *              SceneJS.scale(function(data) {        // Function in this case, instead of a config object
 *                       return {
 *                           x: data.get("sizeX"),
 *                           y: data.get("sizeY"),
 *                           z: data.get("sizeZ")
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

    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing matrix
    const FIXED_DATA = 2;         // Node config is fixed, memoizing matrix

    return SceneJS._utils.createNode(
            "withData",
            cfg.children,

            new (function() {
                var _memoLevel = NO_MEMO;
                var _data = {};
                var _childData;

                this.setProperty = function(key, value) {
                    _data[key] = value;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                this.getProperty = function(key) {
                    return data[key];
                };

                this.clearProperties = function() {
                    _data = {};
                    return this;
                };

                this._init = function(params) {
                    for (var key in params) {
                        _data[key] = params[key];
                    }
                };

                if (cfg.fixed) {
                    this._init(cfg.getParams());
                }

                this._render = function(traversalContext, data) {
                    if (_memoLevel == NO_MEMO) {
                        if (!cfg.fixed) {
                            this._init(cfg.getParams(data));
                        } else {
                            _memoLevel = FIXED_CONFIG;
                        }
                    }
                    if (_memoLevel < FIXED_DATA) {
                        _childData = SceneJS._utils.newScope(data, cfg.fixed);
                        for (var key in _data) {
                            _childData.put(key, _data[key]);
                        }
                        if (_memoLevel == FIXED_CONFIG && data.isfixed()) {
                            _memoLevel = FIXED_DATA;
                        }
                    }
                    this._renderChildren(traversalContext, _childData);
                };
            })());
};


