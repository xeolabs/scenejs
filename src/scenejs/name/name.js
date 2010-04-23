/**
 * Scene node that specifies a name for the nodes in its subgraph. These may be nested to create hierarchical
 * names, effectively overlaying semantics onto a scene.
 */
SceneJS.name = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var errorBackend = SceneJS._backends.getBackend('error');
    var nameBackend = SceneJS._backends.getBackend('naming');

    return SceneJS._utils.createNode(
            "name",
            cfg.children,

            new (function() {

                var _name = "unnamed";

                /**
                 * Sets the name value
                 * @param {string} name The name value
                 * @returns {SceneJS.name} This name node
                 */
                this.setName = function(name) {
                    if (!name) {
                        errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.name name is undefined"));
                    }
                    name = name.replace(/^\s+|\s+$/g, ''); // Trim
                    if (name.length == 0) {
                        errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.name name cannot be empty string"));
                    }
                    _name = name;
                    return this;
                };

                /** Returns the name value
                 * @returns The name string
                 */
                this.getName = function() {
                    return _name;
                };

                this._init = function (params) {
                    if (params.name) {
                        this.setName(params.name);
                    }
                };

                if (cfg.fixed) {
                    this._init(cfg.getParams());
                }

                this._render = function(traversalContext, data) {
                    if (!cfg.fixed) {
                        this._init(cfg.getParams(data));
                    }
                    nameBackend.pushName(_name);
                    this._renderChildren(traversalContext, data);
                    nameBackend.popName();
                };
            })());
};




