/** Asynchronously loads a subgraph cross-domain. This node is configured with the location of a file
 * that describes the subgraph. When first visited, it will start the load, then finish the load and
 * integrate the subgraph on a future visit.
 *
 * Can be configured with child nodes to visit while the load is in progress, which will be replaced by
 * the loaded subgraph.
 */
SceneJS.load = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of SceneJS.load nodes is not supported");
    }
    var params;

    var backend = SceneJS._backends.getBackend("load");
    var logging = SceneJS._backends.getBackend("logging");
    var process = null;
    var assetNode;

    const STATE_INITIAL = 0;        // Ready to start load
    const STATE_LOADING = 2;        // Load in progress
    const STATE_LOADED = 3;         // Load completed
    const STATE_ATTACHED = 4;       // Subgraph integrated
    const STATE_ERROR = -1;         // Asset load or texture creation failed

    var state = STATE_INITIAL;

    function sceneJSParser(data, onError) {
        if (!data.___isSceneJSNode) {
            onError(data.error || "unknown server error");
            return null;
        } else {
            return data;
        }
    }

    function visitSubgraph(params, data) {
        if (params) { // Parameters for asset - supply in a new child data
            var childScope = SceneJS._utils.newScope(data, cfg.fixed);
            for (var key in params.params) {
                childScope.put(key, params.params[key]);
            }
            assetNode.func.call(this, childScope);
        } else {
            assetNode.func.call(this, data);
        }
    }

    return SceneJS._utils.createNode(
            function(data) {

                if (!params) {
                    params = cfg.getParams(data);
                    if (!params.uri) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory SceneJS.load parameter missing: uri");
                    }                 
                }

                if (state == STATE_ATTACHED) {
                    if (!backend.getAsset(params.uri)) {
                        state = STATE_INITIAL;
                    }
                }

                switch (state) {
                    case STATE_ATTACHED:
                        visitSubgraph(params.params, data);
                        break;

                    case STATE_LOADING:
                        break;

                    case STATE_LOADED:
                        backend.assetLoaded(process);  // Finish loading - kill process
                        process = null;
                        state = STATE_ATTACHED;
                        visitSubgraph(params.params, data);
                        break;

                    case STATE_INITIAL:
                        state = STATE_LOADING;
                        process = backend.loadAsset(// Process killed automatically on error or abort
                                params.uri,
                                params.serverParams || {
                                    format: "scenejs"
                                },
                                params.parser || sceneJSParser,
                                function(asset) { // Success
                                    assetNode = asset;   // Asset is wrapper created by SceneJS._utils.createNode
                                    state = STATE_LOADED;
                                },
                                function() { // onTimeout
                                    state = STATE_ERROR;                                 
                                },
                                function(msg) { // onError - backend has killed process
                                    state = STATE_ERROR;
                                    logging.getLogger().error(
                                            "SceneJS.load failed - " + msg + " - uri: " + params.uri);
                                });

                        SceneJS._utils.visitChildren(cfg, data);
                        break;

                    case STATE_ERROR:
                        SceneJS._utils.visitChildren(cfg, data);
                        break;
                }
            });
};