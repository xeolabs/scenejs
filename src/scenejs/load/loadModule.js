/**
 * Backend module that services the SceneJS.loadXXX nodes to manage the asynchronous cross-domain
 * load and caching of remotely-stored scene fragments.
 *
 * Uses the memory management backend to mediate cache management.
 *
 *  @private
 */
var SceneJS_loadModule = new (function() {

    var time = (new Date()).getTime();
    var proxyUri = null;
    var assets = {};        // Asset content subgraphs for eviction, not reuse

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                assets = {};
            });

    /** @private */
    function _loadFile(url, onLoad, onError) {
        try {
            var x;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        onLoad(request.responseText);
                    } else {
                        onError(request.status, request.statusText);
                    }
                }
            };
            request.open("GET", url, true);
            request.send(null);
        }
        catch (e) {
            onError(request.status, e.toString());
        }
    }

    /** @private */
    function _loadAssetSameDomain(uri, assetId, parser, onSuccess, onError) { 
        _loadFile(uri,
                function(data) {  // onLoad
                    if (!data) {
                        onError(new SceneJS.EmptyResponseException("loaded content is empty"));
                    } else {
                        var assetNode = parser(
                                data,
                                function(msg) {
                                    onError(msg);
                                });
                        if (!assetNode) {
                            onError(new SceneJS.InternalException("parser returned null result"));
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
                },
                function(status, statusText) {
                    onError(new SceneJS.HttpException(status + " - " + (statusText || "")));
                });
    }

    /** @private */
    function _jsonp(fullUri, callbackName, onLoad) {
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
     * @private
     */
    function _loadAssetCrossDomain(uri, assetId, serverParams, callbackName, parser, onSuccess, onError) {
        var url = [proxyUri, "?callback=", callbackName , "&uri=" + uri];
        for (var param in serverParams) { // TODO: memoize string portion that contains params
            url.push("&", param, "=", serverParams[param]);
        }
        _jsonp(url.join(""),
                callbackName,
                function(data) {    // onLoad
                    if (!data) {
                        onError(new SceneJS.ProxyEmptyResponseException("proxy server response is empty"));
                    } else if (data.error) {
                        onError(new SceneJS.ProxyErrorResponseException("proxy server responded with error - " + data.error));
                    } else {
                        var assetNode = parser(
                                data,
                                function(msg) {
                                    onError(msg);
                                });
                        if (!assetNode) {
                            onError(new SceneJS.InternalException("parser returned null result"));
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

    // @private
    this.setProxy = function(_proxyUri) {
        proxyUri = _proxyUri;
    };

    /** Attempts to get currently-loaded asset, which may have been evicted
     * @private
     */
    this.getAsset = function(handle) {
        var asset = assets[handle.assetId];
        if (asset) {
            asset.lastUsed = time;
            return asset.node;
        }
        return null;
    };

    /**
     * Triggers asynchronous JSONP load of asset, creates new process and handle; callback
     * will fire with new child for the  client asset node. The asset node will have to then call assetLoaded
     * to notify the backend that the asset has loaded and allow backend to kill the process.
     *
     * JSON does not handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
     *
     * @private
     * @uri Location of asset
     * @serverParams Request parameters for proxy
     * @parser Processes asset data on load
     * @onSuccess Callback through which processed asset data is returned
     * @onTimeout Callback invoked when no response from proxy
     * @onError Callback invoked when error reported by proxy
     */
    this.loadAsset = function(uri, serverParams, parser, onSuccess, onTimeout, onError) {
        //        if (!proxyUri) {
        //            SceneJS_errorModule.fatalError(new SceneJS.ProxyNotSpecifiedException
        //                    ("Scene definition error - SceneJS.load node expects a 'proxy' property on the SceneJS.scene node"));
        //        }
        if (proxyUri) {
            SceneJS_loggingModule.debug("Loading asset cross-domain from " + uri);
        } else {
            SceneJS_loggingModule.debug("Loading asset from local domain " + uri);
        }
        var assetId = SceneJS._createKeyForMap(assets, "asset");
        var process = SceneJS_processModule.createProcess({
            onTimeout: function() {  // process killed automatically on timeout
                SceneJS_loggingModule.error(
                        "Asset load failed - timed out waiting for a reply " +
                        "(incorrect proxy URI?) - proxy: " + proxyUri +
                        ", uri: " + uri);
                onTimeout();
            },
            description:"asset load: proxy = " + proxyUri + ", uri = " + uri,
            timeoutSecs: 180 // Big timeout to allow files to parse
        });
        if (proxyUri) {
            var callbackName = "callback" + process.id; // Process ID is globally unique
            _loadAssetCrossDomain(
                    uri,
                    assetId,
                    serverParams,
                    callbackName,
                    parser,
                    onSuccess,
                    function(msg) {  // onError
                        SceneJS_processModule.killProcess(process);
                        onError(msg);
                    });
        } else {
            _loadAssetSameDomain(
                    uri,
                    assetId,
                    parser,
                    onSuccess,
                    function(msg) {  // onError
                        SceneJS_processModule.killProcess(process);
                        onError(msg);
                    });
        }
        var handle = {
            process: process,
            assetId : assetId
        };
        return handle;
    };

    /** Notifies backend that load has completed; backend then kills the process.
     * @private
     */
    this.assetLoaded = function(handle) {
        SceneJS_processModule.killProcess(handle.process);
    };

})();