/** Asynchronously imports an asset from a file into a scene graph. This node is configured with the location of a file
 * that describes a (portion of) a 3D scene. When first visited, it will cause that file to be imported into the scene
 * graph to become its subtree, providing that a backend has been installed to help SceneJS asset that particular file
 * type.
 */
SceneJS.asset = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of asset nodes is not supported");
    }

    var backend = SceneJS._backends.getBackend("asset");
    var logging = SceneJS._backends.getBackend("logging");
    var process = null;
    var loading = false; // Node is trying to load asset when this is true
    var error = false;  // Node has given up trying to load when this is true

    return SceneJS._utils.createNode(
            function(scope) {

                if (!error) { // Asset functionality permanently short-circuits when error ocurred
                    var params = cfg.getParams(scope);

                    if (!params.proxy) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException("Mandatory asset parameter missing: proxy");
                    }

                    if (!params.uri) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException("Mandatory asset parameter missing: uri");
                    }

                    var assetNode = backend.getAsset(params.uri); // Backend may have evicted asset after lack of recent use

                    if (!assetNode && !loading) {

                        loading = true;

                        process = backend.loadAsset(
                                params.uri,
                                params.proxy,

                                function(_assetNode) { // Success
                                    assetNode = _assetNode;
                                },
                                function() { // onTimeout
                                    error = true;
                                    logging.getLogger().error(
                                            "Asset load failed - timed out waiting for a reply " +
                                            "(incorrect proxy URI?) - proxy: " + params.proxy +
                                            ", uri: " + params.uri);
                                },
                                function(msg) { // onError - backend has killed process
                                    error = true;
                                    logging.getLogger().error(
                                            "Asset load failed - " + msg +
                                            " - proxy: " + params.proxy + ", uri: " + params.uri);
                                });

                    } else if (assetNode) {

                        if (loading) {
                            backend.assetLoaded(process);  // Finish loading - kill process
                            process = null;
                            loading = false;
                        }

                        if (params.params) { // Parameters for asset - supply in a new child scope
                            var childScope = SceneJS._utils.newScope(scope, cfg.fixed);
                            for (var key in params.params) {
                                childScope.put(key, params.params[key]);
                            }
                            assetNode.call(this, childScope);
                        } else {
                            assetNode.call(this, scope);
                        }
                    }
                }

                SceneJS._utils.visitChildren(cfg, scope);
            });
};


