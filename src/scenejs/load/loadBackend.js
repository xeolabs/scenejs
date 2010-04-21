/**
 * Backend module that services the SceneJS.assets.XXX nodes to manage the asynchronous cross-domain
 * load and caching of remotely-stored scene fragments.
 *
 * Uses the memory management backend to mediate cache management.
 */
SceneJS._backends.installBackend(

        "load",

        function(ctx) {

            var time = (new Date()).getTime();
            var proxyUri = null;
            var assets = {};        // Asset content subgraphs for eviction, not reuse

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        assets = {};
                    });

            function jsonp(fullUri, callbackName, onLoad) {
                var head = document.getElementsByTagName("head")[0];
                var script = document.createElement("script");
                script.type = "text/javascript";
                window[callbackName] = function(data) {
                    onLoad(data);
                    window[callbackName] = undefined;
                    try {
                        delete window[callbackName];
                    } catch(e) {
                    }
                    head.removeChild(script);
                };
                head.appendChild(script);
                script.src = fullUri;  // Request fires now
            }

            /** Loads asset and caches it against uri
             */
            function _loadAsset(uri, assetId, serverParams, callbackName, parser, onSuccess, onError) {
                var url = [proxyUri, "?callback=", callbackName , "&uri=" + uri];
                for (var param in serverParams) { // TODO: memoize string portion that contains params
                    url.push("&", param, "=", serverParams[param]);
                }
                jsonp(url.join(""),
                        callbackName,
                        function(data) {    // onLoad
                            if (!data) {
                                onError("server response is empty");
                            } else {
                                var assetNode = parser(
                                        data,
                                        function(msg) {
                                            onError(msg);
                                        });
                                if (!assetNode) {
                                    onError("asset node's parser returned null result");
                                } else {
                                    assets[assetId] = {
                                        assetId: assetId,
                                        uri: uri,
                                        node: assetNode,
                                        lastUsed: time
                                    };
                                    onSuccess(assetNode);
                                }
                            }
                        });


            }

            return { // Node-facing API

                setProxy: function(_proxyUri) {
                    proxyUri = _proxyUri;
                },

                /** Attempts to get currently-loaded asset, which may have been evicted
                 */
                getAsset : function(handle) {
                    var asset = assets[handle.assetId];
                    if (asset) {
                        asset.lastUsed = time;
                        return asset.node;
                    }
                    return null;
                },

                /**
                 * Triggers asynchronous JSONP load of asset, creates new process and handle; callback
                 * will fire with new child for the  client asset node. The asset node will have to then call assetLoaded
                 * to notify the backend that the asset has loaded and allow backend to kill the process.
                 *
                 * JSON does not handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
                 *
                 * @uri Location of asset
                 * @serverParams Request parameters for proxy
                 * @parser Processes asset data on load
                 * @onSuccess Callback through which processed asset data is returned
                 * @onTimeout Callback invoked when no response from proxy
                 * @onError Callback invoked when error reported by proxy
                 */
                loadAsset : function(uri, serverParams, parser, onSuccess, onTimeout, onError) {
                    if (!proxyUri) {
                        ctx.error.fatalError(new SceneJS.exceptions.ProxyNotSpecifiedException
                                ("Scene definition error - SceneJS.load node expects a 'proxy' property on the SceneJS.scene node"));
                    }
                    ctx.logging.debug("Loading asset from " + uri);
                    var assetId = SceneJS._utils.createKeyForMap(assets, "asset");
                    var process = ctx.processes.createProcess({
                        onTimeout: function() {  // process killed automatically on timeout
                            ctx.logging.error(
                                    "Asset load failed - timed out waiting for a reply " +
                                    "(incorrect proxy URI?) - proxy: " + proxyUri +
                                    ", uri: " + uri);
                            onTimeout();
                        },
                        description:"asset load: proxy = " + proxyUri + ", uri = " + uri,
                        timeoutSecs: 180 // Big timeout to allow files to parse
                    });
                    var callbackName = "callback" + process.id; // Process ID is globally unique
                    _loadAsset(
                            uri,
                            assetId,
                            serverParams,
                            callbackName,
                            parser,
                            onSuccess,
                            function(msg) {  // onError
                                ctx.processes.killProcess(process);
                                onError(msg);
                            });
                    var handle = {
                        process: process,
                        assetId : assetId
                    };
                    return handle;
                },

                /** Notifies backend that load has completed; backend then kills the process.
                 */
                assetLoaded : function(handle) {
                    ctx.processes.killProcess(handle.process);
                }
            };
        });