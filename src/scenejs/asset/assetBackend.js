/**
 * Backend module that services the SceneJS.assets.XXX nodes to manage the asynchronous cross-domain
 * load and caching of remotely-stored scene fragments.
 *
 * Uses the memory management backend to mediate cache management.
 */
SceneJS._backends.installBackend(

        "assets",

        function(ctx) {

            var time = (new Date()).getTime();
            var assets = {};                        // Nodes created by parsers, cached against file name

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
            function _loadAsset(uri, proxy, serverParams, callbackName, parser, onSuccess, onError) {
                var url = [proxy, "?callback=", callbackName , "&uri=" + uri];
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
                                    assets[uri] = {
                                        uri: uri, // Asset idenitifed by URI
                                        node: assetNode,
                                        lastUsed: time
                                    };

                                    onSuccess(assetNode);
                                }
                            }
                        });
            }

            return { // Node-facing API

                /** Atempts to get currently-loaded asset, which may have been evicted, in which case
                 * node should then just call loadAsset to re-load it.
                 */
                getAsset : function(uri) {
                    var asset = assets[uri];
                    if (asset) {
                        asset.lastUsed = time;
                        return asset.node;
                    }
                    return null;
                },

                /**
                 * Triggers asynchronous JSONP load of asset and creates new process; callback will fire with new child for the
                 * client asset node. The asset node will have to then call assetLoaded to notify the backend that the
                 * asset has loaded and allow backend to kill the process.
                 *
                 * JSON does nto handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
                 */
                loadAsset : function(uri, proxy, serverParams, parser, onSuccess, onTimeout, onError) {
                    ctx.logging.debug("Loading asset from " + uri);
                    var process = ctx.processes.createProcess({
                        onTimeout: function() {  // process killed automatically on timeout
                            onTimeout();
                        },
                        description:"asset load from " + uri
                    });
                    var callbackName = "callback" + process.id; // Process ID is globally unique
                    _loadAsset(
                            uri,
                            proxy,
                            serverParams,
                            callbackName,
                            parser,
                            onSuccess,
                            function(msg) {  // onError
                                ctx.processes.destroyProcess(process);
                                onError(msg);
                            });
                    return process;
                },

                /** Notifies backend that load has completed; backend then kills the process.
                 */
                assetLoaded : function(process) {
                    ctx.processes.destroyProcess(process);
                }
            };
        });