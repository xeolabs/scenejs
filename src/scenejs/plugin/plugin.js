/** Asynchronously imports an asset from a file into a scene graph. This node is configured with the location of a file
 * that describes a (portion of) a 3D scene. When first visited, it will cause that file to be imported into the scene
 * graph to become its subtree, providing that a backend has been installed to help SceneJS asset that particular file
 * type.
 */
SceneJS.withPlugin = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of withPlugin nodes is not supported");
    }
    var params;

    var backend = SceneJS._backends.getBackend("import");
    var logging = SceneJS._backends.getBackend("logging");
    var process = null;
    var assetNode;

    const STATE_INITIAL = 0;            // Ready to get asset
    const STATE_ASSET_LOADING = 2;      // Asset load in progress
    const STATE_ASSET_LOADED = 3;       // Asset load completed
    const STATE_ASSET_ATTACHED = 4;     // Asset created
    const STATE_ERROR = -1;             // Asset load or texture creation failed

    var state = STATE_INITIAL;

    function responseParser(data, onError) {
        if (!data.___isSceneJSNode) {
            onError(data.error || "unknown server error");
            return null;
        } else {
            return data;
        }
    }

    return SceneJS._utils.createNode(
            function(data) {

                if (!params) {
                    params = cfg.getParams(data);
                    if (!params.uri) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory withPlugin parameter missing: uri");
                    }
                    if (!params.proxy) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory withPlugin parameter missing: proxy");
                    }
                }

                if (state == STATE_ASSET_ATTACHED) {
                    if (!backend.getAsset(params.uri)) {
                        state = STATE_INITIAL;
                    }
                }

                switch (state) {
                    case STATE_ASSET_ATTACHED:
                        visitAsset(params.params, data);
                        break;

                    case STATE_ASSET_LOADING:
                        break;

                    case STATE_ASSET_LOADED:
                        backend.assetLoaded(process);  // Finish loading - kill process
                        process = null;
                        state = STATE_ASSET_ATTACHED;
                        SceneJS._utils.visitChildren(cfg, data);
                        break;

                    case STATE_INITIAL:
                        state = STATE_ASSET_LOADING;
                        process = backend.loadAsset(// Process killed automatically on error or abort
                                params.uri,
                                params.proxy,
                                params.serverParams || {
                                    format: "scenejs"
                                },
                                params.parser || responseParser,
                                function(asset) { // Success
                                    assetNode = asset;   // Asset is wrapper created by SceneJS._utils.createNode
                                    state = STATE_ASSET_LOADED;
                                },
                                function() { // onTimeout
                                    state = STATE_ERROR;
                                    logging.getLogger().error(
                                            "Plugin load failed - timed out waiting for a reply " +
                                            "(incorrect proxy URI?) - proxy: " + params.proxy +
                                            ", uri: " + params.uri);
                                },
                                function(msg) { // onError - backend has killed process
                                    state = STATE_ERROR;
                                    logging.getLogger().error(
                                            "Plugin load failed - " + msg +
                                            " - proxy: " + params.proxy + ", uri: " + params.uri);
                                });
                        break;

                    case STATE_ERROR:
                        break;
                }
            });
};