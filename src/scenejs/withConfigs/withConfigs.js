/**
 * @class Invokes addXXX, removeXXX and setXXX methods on the nodes in its subgraph during traversal to set, delete or add
 * elements on them.</p>.
 * <p>The configuration for a {@link SceneJS.WithConfigs} is a hierarchical map of values for methods on
 * nodes in the subgraph. As shown in the examples below, its hierarchy maps to that of the subgraph. The keys beginning
 * with "#" map to the SIDs of nodes. In the first example, we have property keys that map to setter methods on
 * those nodes. In the second example we have a property key prefixed with "+", which maps it to a method beginning
 * with "add" (addNode). In the third example, we have a property key prefixed with "-", which maps it to a method
 * beginning with "remove" (removeNode).</p>
 *
 * <p>The functionality of {@link SceneJS.WithConfigs} is also provided in the {@link SceneJS.Socket} node, which allows
 * a server to push a configuration map onto a scene subgraph through a WebSocket.</p>
 *
 * <p>Note that configs are applied to nodes just before they are rendered, so as long as your config map
 * resolves correctly, the nodes don't have to have initial configurations wherever you have specified them for "setXXX"
 * methods in the config map.</p>
 *
 * <h2>Example 1: Setting properties on subnodes</h2>
 * <p><b>Example 1:</b></p><p>Configuring properties on {@link SceneJS.Translation} and {@link SceneJS.Scale} nodes in the subgraph:</b></p><pre><code>
 * var wc = new SceneJS.WithConfigs({
 *
 *         // Optionally you can specify that the configs map is to be forgotten as soon as it is used,
 *         // where the WithConfigs node only applies it the first time it is rendered, before clearing it.
 *         // In this case, our WithConfigs applies it every time:
 *
 *         once : false,
 *
 *         // Optionally have the WithConfigs throw a SceneJS.errors.WithConfigsNodeNotFoundException if any target node
 *         // is not found at exactly the hierarchy position specified in our configs map.
 *         //
 *         // Default is false, which would allow unmatched nodes to be simply skipped as traversal
 *         // descends into the subgraph.
 *         //
 *         strictNodes : true,       // Default is false
 *
 *         // Have the WithConfigs throw a SceneJS.errors.WithConfigsPropertyNotFoundException if any target property
 *         // is not found on its target node.
 *         //
 *         // Default is true.
 *         //
 *         strictProperties : true,  // Default is true
 *
 *         configs: {
 *             "#myTranslate" : {    // Selects the SceneJS.Scale
 *                  x: 5,            // Invokes the setX, setY and setZ methods of the SceneJS.Translate
 *                  y: 10,
 *                  z: 2,
 *
 *                  "#myScale" : {   // Selects the SceneJS.Scale
 *                      x: 2.0,      // Invokes the setX and setY methods of the SceneJS.Scale
 *                      z: 1.5
 *                   }
 *             }
 *          }
 *      },
 *
 *      new SceneJS.Translate({
 *                     sid: "myTranslate",
 *                     x: 100,
 *                     y: 20,
 *                     z: 15
 *                  },
 *
 *          new SceneJS.Scale({
 *                        sid: "myScale",
 *                        x : 1.0
 *                     },
 *
 *                new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 * </code></pre>
 *
 * <h2>Adding elements to subnodes</h2>
 * <p><b>Example:</b></p><p>In this example we're using a WithConfigs node to attach a subgraph to a target node
 * within it's own subgraph. Abstractly, a teapot is being attached to a chair at a table in a cafe. Note
 * the "+node" key in the map for the "chair2" node, which maps to the "addNode" method on that node.</b></p><pre><code>
 * var wc = SceneJS.withConfigs({
 *         strictNodes : true,       // Target node must exist - default is false
 *         strictProperties : true,  // Function addNode must exist on target node - default is true
 *         configs: {
 *             "#cafe": {
 *                  "#table5" : {
 *                      "#chair2" : {
 *
 *                          // Content we're attaching. "+node" directs the WithConfig
 *                          // to call the "addNode" method on the Node at the attachment
 *                          // point to attach the object
 *                          //
 *                          "+node" :
 *                               SceneJS.rotate({ // The object to attach - imagine
 *                                         angle: 0,    // this teapot is a person!
 *                                         y : 1.0
 *                                    },
 *                                    SceneJS.objects.teapot())
 *                               }
 *                          }
 *                      }
 *                  }
 *             },
 *             SceneJS.node({ sid: "cafe" },
 *                  SceneJS.translate({ x: -1, y: 0, z: -1},
 *                      SceneJS.node({ sid: "table5" },
 *                          SceneJS.translate({ x: 1, y: 0, z: 1},
 *
 *                             // Attachment point
 *
 *                             SceneJS.node({ sid: "chair2" }))))))
 * </code></pre>
 *
 * <h2>Removing elements from subnodes</h2>
 * <p><b>Example:</b></p><p>In this example we're using a WithConfigs node to delete a subgraph from a target node.
 * Abstractly, a chair is being removed from a table in a cafe. Note the "-node" key in the map for the "chair2" node,
 * which maps to the "removeNode" method on that node, and the value, which is the SID of the node to remove.</b></p><pre><code>
 * var wc = SceneJS.withConfigs({
 *         strictNodes : true,        // Target node must exist - default is false
 *         strictProperties : true,   // Function addNode must exist on target node - default is true
 *         configs: {
 *             "#cafe": {
 *                  "#table5" : {
 *
 *                      // Content we're removing. "-node" directs the WithConfig
 *                      // to call the "removeNode" method on the "table5" target Node
 *                      //
 *                      "-node" : "#chair2"
 *                  }
 *             },
 *             SceneJS.node({ sid: "cafe" },
 *                  SceneJS.translate({ x: -1, y: 0, z: -1},
 *
 *                      // Target node
 *
 *                      SceneJS.node({ sid: "table5" },
 *                          SceneJS.translate({ x: 1, y: 0, z: 1},
 *
 *                             // Removing this subnode:
 *
 *                             SceneJS.node({ sid: "chair2" }))))))
 * </code></pre>
 * @extends SceneJS.Node
 * @since Version 0.7.6
 * @constructor
 * Create a new SceneJS.WithConfigs
 * @param {Object} [cfg] Static configuration object containing hierarchical map of values for sub-nodes
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function returning the hierarchical map
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.WithConfigs = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "with-configs";
    this._configs = {};
    this._once = false;
    this._configsModes = {
        strictProperties : true,
        strictNodes : false
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.WithConfigs, SceneJS.Node);

/**
 Sets the configs map
 @param {Object} configs The configs map
 @returns {SceneJS.WithConfigs} this
 */
SceneJS.WithConfigs.prototype.setConfigs = function(configs, once) {
    this._configs = configs;
    if (once != undefined) {
        this._once = once;
    }
    this._memoLevel = 0;
    return this;
};

/**
 * Returns the configs map
 *
 * @returns {Object} The configs map
 */
SceneJS.WithConfigs.prototype.getConfigs = function() {
    return this._configs;
};

/**
 Sets whether the configs map is forgotten as soon as the node has rendered, ie. to apply only once.
 @param {boolean} once - Will forget when this is true
 @returns {SceneJS.WithConfigs} this
 */
SceneJS.WithConfigs.prototype.setOnce = function(once) {
    this._once = once;
    if (once != undefined) {
        this._once = once;
    }
    this._memoLevel = 0;
    return this;
};

/**
 * Sets whether the configs map is forgotten as soon as the node has rendered, ie. to apply only once.
 *
 * @returns {boolean} True if to forget, else false
 */
SceneJS.WithConfigs.prototype.getOnce = function() {
    return this._once;
};

/**
 * Specifies whether or not a {@link SceneJS.errors.WithConfigsPropertyNotFoundException} is to be raised when
 * a property reference on the WithConfigs config map cannot be resolved to any method on a target node.
 * @param {Boolean} value When true, enables exception
 */
SceneJS.WithConfigs.prototype.setStrictProperties = function(value) {
    this._configsModes.strictProperties = value;
};

/**
 * Returns whether or not a {@link SceneJS.errors.WithConfigsPropertyNotFoundException} will be raised when
 * a property reference on the WithConfigs config map cannot be resolved to any method on a target node.
 * @returns {Boolean} When true, exception is enabled
 */
SceneJS.WithConfigs.prototype.getStrictProperties = function() {
    return this._configsModes.strictProperties;
};

/**
 * Specifies whether or not a {@link SceneJS.errors.WithConfigsNodeNotFoundException} exception is to be raised when
 * a node reference in the WithConfigs config map cannot be resolved to its target node in the subgraph.
 * @param {Boolean} value When true, enables exception
 */
SceneJS.WithConfigs.prototype.setStrictNodes = function(value) {
    this._configsModes.strictNodes = value;
};

/**
 * Returns whether or not a {@link SceneJS.errors.WithConfigsNodeNotFoundException} exception will be raised when
 * a node reference on the WithConfigs config map cannot be resolved to its target node in the subgraph.
 * @returns {Boolean} When true, exception is enabled
 */
SceneJS.WithConfigs.prototype.getStrictNodes = function() {
    return this._configsModes.strictNodes;
};

SceneJS.WithConfigs.prototype._init = function(params) {
    this._configs = params.configs || {};
    this._once = params.once != undefined ? params.once : false;
};

SceneJS.WithConfigs.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
            this._configs = this._preprocessConfigs(this._configs);
        } else {
            this._memoLevel = 1;
            this._configs = this._preprocessConfigs(this._configs);
        }
    }
    //    if (this._memoLevel < 2) {
    //        if (this._memoLevel == 1 && data.isFixed() && !SceneJS._instancingModule.instancing()) {
    //            this._memoLevel = 2;
    //        }
    //    }
    traversalContext = {
        appendix : traversalContext.appendix,
        insideRightFringe: this._children.length > 1,
        configs : this._configs,
        configsModes : this._configsModes
    };
    // this._renderNodes(traversalContext, new SceneJS.Data(data, this._fixedParams, this._data));
    this._renderNodes(traversalContext, data);

    if (this._once) {
        this._configs = {};
    }
};


/* Preprocess config map for faster application when rendering nodes
 */
SceneJS.WithConfigs.prototype._preprocessConfigs = function(configs) {
    var configAction;
    var funcName;
    var newConfigs = {};
    for (var key in configs) {
        if (configs.hasOwnProperty(key)) {
            key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
            if (key.length > 0) {
                configAction = key.substr(0, 1);
                if (configAction != "#") {  // Property reference
                    if (configAction == "+") {
                        funcName = "add" + key.substr(1, 1).toUpperCase() + key.substr(2);
                    } else if (configAction == "-") {
                        funcName = "remove" + key.substr(1, 1).toUpperCase() + key.substr(2);
                    } else {
                        funcName = "set" + key.substr(0, 1).toUpperCase() + key.substr(1);
                    }
                    newConfigs[funcName] = {
                        isFunc : true,
                        value : configs[key]
                    };

                } else {
                    if (configs[key] instanceof Function) {
                        newConfigs[key.substr(1)] = configs[key];
                    } else {
                        newConfigs[key.substr(1)] = this._preprocessConfigs(configs[key]);
                    }
                }
            }
        }
    }
    return newConfigs;
};


/**
 * Factory function that returns a new {@link SceneJS.WithConfigs} instance
 * @param {Object} [cfg] Static config map object
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function returning the config map
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.WithConfigs}
 * @since Version 0.7.6
 */
SceneJS.withConfigs = function() {
    var n = new SceneJS.WithConfigs();
    SceneJS.WithConfigs.prototype.constructor.apply(n, arguments);
    return n;
};