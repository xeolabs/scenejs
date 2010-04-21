/** Asynchronously loads a subgraph cross-domain. This node is configured with the location of a file
 * that describes the subgraph. When first visited, it will start the load, then finish the load and
 * integrate the subgraph on a future visit.
 *
 * Can be configured with child nodes to visit while the load is in progress, which will be replaced by
 * the loaded subgraph.
 */
SceneJS.load = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var params;

    var backend = SceneJS._backends.getBackend("load");
    var logging = SceneJS._backends.getBackend("logging");
    var errorBackend = SceneJS._backends.getBackend("error");
    var assetNode;
    var handle;

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
        var traversalContext = {
            appendix : cfg.children
        };
        if (params) { // Parameters for asset - supply in a new child data
            var childData = SceneJS._utils.newScope(data, cfg.fixed);
            for (var key in params.params) {
                childData.put(key, params.params[key]);
            }
            assetNode.func.call(this, traversalContext, childData);
        } else {
            assetNode.func.call(this, traversalContext, data);
        }
    }

    return SceneJS._utils.createNode(
            function(traversalContext, data) {

                if (!params) {
                    params = cfg.getParams(data);
                    if (!params.uri) {
                        errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                ("Scene definiton error - mandatory SceneJS.load parameter missing: uri"));
                    }
                }

                if (state == STATE_ATTACHED) {
                    if (!backend.getAsset(handle)) {
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
                        backend.assetLoaded(handle);  // Finish loading - kill process
                        state = STATE_ATTACHED;
                        visitSubgraph(params.params, data);
                        break;

                    case STATE_INITIAL:
                        state = STATE_LOADING;

                        /* Asset not currently loaded or loading - load it
                         */
                        handle = backend.loadAsset(// Process killed automatically on error or abort
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
                                    errorBackend.error(
                                            new SceneJS.exceptions.AssetLoadTimeoutException(
                                                    "SceneJS.load timed out - uri: " + params.uri));
                                },
                                function(msg) { // onError - backend has killed process
                                    state = STATE_ERROR;
                                    errorBackend.error("SceneJS.load failed - " + msg + " - uri: " + params.uri);
                                });
                        break;

                    case STATE_ERROR:
                        break;
                }
            });
};