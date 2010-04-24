/**
 * Scene node that specifies a name for the nodes in its subgraph. These may be nested to create hierarchical
 * names, effectively overlaying semantics onto a scene.
 *
 * @class SceneJS.name
 * @extends SceneJS.node
 */
SceneJS.name = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {
        var _name = "unnamed";

        /**
         * Sets the name value
         * @param {string} name The name value
         * @returns {SceneJS.name} This name node
         */
        $.setName = function(name) {
            if (!name) {
                SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.name name is undefined"));
            }
            name = name.replace(/^\s+|\s+$/g, ''); // Trim
            if (name.length == 0) {
                SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.name name cannot be empty string"));
            }
            _name = name;
            return this;
        };

        /** Returns the name value
         * @returns The name string
         */
        $.getName = function() {
            return _name;
        };

        function init(params) {
            if (params.name) {
                $.setName(params.name);
            }
        };

        if (cfg.fixed) {
            init(cfg.getParams());
        }

        $._render = function(traversalContext, data) {
            if (!cfg.fixed) {
                this._init(cfg.getParams(data));
            }
            SceneJS_nameModule.pushName(_name);
            $._renderChildren(traversalContext, data);
            SceneJS_nameModule.popName();
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
