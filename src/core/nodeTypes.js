/**
 * Container for custom node types
 */
SceneJS.Types = new (function () {

    /**
     * Installs a node type
     * @param typeName
     * @param methods
     */
    this.addType = function (typeName, methods) {
        SceneJS_NodeFactory.createNodeType(typeName, methods,
            // Augments the basic node type with our custom type's methods
            function (type) {
                var method;
                for (var methodName in methods) {
                    if (methods.hasOwnProperty(methodName)) {
                        method = methods[methodName];
                        switch (methodName) {
                            case "init": // Deprecated
                            case "construct":
                                (function () {
                                    var _method = methods[methodName];
                                    type.prototype._init = function (params) {
                                        _method.call(this, params);
                                    };

                                    // Mark node type as a plugin
                                    type.prototype._fromPlugin = true;
                                })();
                                break;
                            case "destroy": // Deprecated
                            case "destruct":
                                type.prototype._destroy = method;
                                break;
                            default:
                                type.prototype[methodName] = method;
                        }
                    }
                }
            });
    };

    /**
     * Tests if given node type is installed
     * @param typeName
     * @param methods
     */
    this.hasType = function (typeName) {
        return !!SceneJS_NodeFactory.nodeTypes[typeName];
    };
})();

