/**
 * Base for backends for the asset scene node.
 */
SceneJS._backends.installBackend(

        "asset",

        function(ctx) {

            var time = (new Date()).getTime();
            var importers = {};                     // Backend extensions each create one of these
            var assets = {};                        // Nodes created by parsers, cached against file name

            ctx.events.onEvent(// System time update
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(// Framework reset - clear asset cache
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

            function getFileExtension(fileName) {
                var i = fileName.lastIndexOf(".");
                if (i == -1 || i == fileName.length - 1) {
                    throw "Invalid location config for asset node - extension missing";
                }
                return fileName.substr(i + 1);
            }

            /** Loads asset and caches it against uri
             */
            function _loadAsset(proxy, uri, callbackName, importer, onSuccess, onError) {
                var type = getFileExtension(uri);
                if (!importer) {
                    importer = importers[type];
                    if (!importer) {
                        throw "Asset file type not supported: \"" + type + "\"";
                    }
                }
                var url = [proxy, "?callback=", callbackName , "&uri=" + uri, "&mode=js"];
                if (importer.serverParams) {
                    for (var param in importer.serverParams) { // TODO: memoize string portion that contains params
                        url.push("&", param, "=", importer.serverParams[param]);
                    }
                }
                jsonp(url.join(""),
                        callbackName,
                        function(data) {    // onLoad
                            if (!data) {
                                onError("server response is empty");
                            } else {
                                var assetNode = importer.parse(data, function(msg) {
                                    onError(msg);
                                });
                                if (assetNode) {
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

            ctx.assets = {

                /** Installs an importer
                 */
                installImporter : function(cfg) {
                    importers[cfg.type] = {
                        type: cfg.type,
                        parse: cfg.parse,
                        serverParams:cfg.serverParams
                    };
                }
            };

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
                loadAsset : function(uri, proxy, importer, onSuccess, onTimeout, onError) {
                    ctx.logging.debug("Loading asset from " + uri);
                    var process = ctx.processes.createProcess({
                        onTimeout: function() {  // process killed automatically on timeout
                            onTimeout();
                        },
                        description:"asset load from " + uri
                    });
                    var callbackName = "callback" + process.id; // Process ID is globally unique
                    _loadAsset(
                            proxy,
                            uri,
                            callbackName,
                            importer,
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