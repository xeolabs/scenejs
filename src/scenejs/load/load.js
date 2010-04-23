/**
 * Scene node that asynchronously loads its subgraph, cross-domain. This node is configured with the
 * location of a JavaScript file containing a SceneJS definition of the subgraph. When first visited during scene
 * traversal, it will begin the load and allow traversal to cintinue at its next sibling node. When on a subsequent
 * visit its subgraph has been loaded, it will then allow traversal to decsend into that subgraph to render it.
 *
 * @class SceneJS.load
 * @extends SceneJS.node
 */
SceneJS.load = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var params;
    var assetNode;
    var handle;

    const STATE_INITIAL = 0;        // Ready to start load
    const STATE_LOADING = 2;        // Load in progress
    const STATE_LOADED = 3;         // Load completed
    const STATE_ATTACHED = 4;       // Subgraph integrated
    const STATE_ERROR = -1;         // Asset load or texture creation failed

    var state = STATE_INITIAL;

    function sceneJSParser(data, onError) {
        if (!data._render) {
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
            assetNode._render.call(assetNode, traversalContext, childData);
        } else {
            assetNode._render.call(assetNode, traversalContext, data);
        }
    }

    return SceneJS._utils.createNode(
            "load",
            cfg.children,

            new (function() {

                this._render = function(traversalContext, data) {

                    if (!params) {
                        params = cfg.getParams(data);
                        if (!params.uri) {
                            SceneJS_errorModule.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                    ("Scene definiton error - mandatory SceneJS.load parameter missing: uri"));
                        }
                    }

                    if (state == STATE_ATTACHED) {
                        if (!SceneJS_loadModule.getAsset(handle)) {
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
                            SceneJS_loadModule.assetLoaded(handle);  // Finish loading - kill process
                            state = STATE_ATTACHED;
                            visitSubgraph(params.params, data);
                            break;

                        case STATE_INITIAL:
                            state = STATE_LOADING;

                            /* Asset not currently loaded or loading - load it
                             */
                            handle = SceneJS_loadModule.loadAsset(// Process killed automatically on error or abort
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
                                        SceneJS_errorModule.error(
                                                new SceneJS.exceptions.AssetLoadTimeoutException(
                                                        "SceneJS.load timed out - uri: " + params.uri));
                                    },
                                    function(msg) { // onError - SceneJS_loadModule has killed process
                                        state = STATE_ERROR;
                                        SceneJS_errorModule.error("SceneJS.load failed - " + msg + " - uri: " + params.uri);
                                    });
                            break;

                        case STATE_ERROR:
                            break;
                    }
                };
            })());
};