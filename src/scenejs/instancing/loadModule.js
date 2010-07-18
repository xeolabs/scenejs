/**
 * Backend module that services the SceneJS.Instance node to manage the asynchronous cross-domain
 * load and caching of remotely-stored scene fragments.
 *
 * Uses the memory management backend to mediate cache management.
 *
 *  @private
 */
SceneJS._loadModule = new (function() {
    var parsers = {};
    var time = (new Date()).getTime();
    var jsonpStrategy = null;
    var defaultLoadTimeoutSecs = 180;
    var assets = {};
    var sceneLibraries = {}; // Library asset set for each active scene
    var sceneLibrary;  // Library of currently active scene
    var pInterval; // For polling SceneJS.Asset to update their statii

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    /* When SceneJS initialised, start the assets status update loop
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {
                assets = {};
                if (!pInterval) {
                    pInterval = setInterval("SceneJS._loadModule._updateSceneJSLoads()", 100);
                }
            });

    /* When SceneJS reset, destroy all assets
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                assets = {};
                //                if (!pInterval) {
                //                    pInterval = setInterval("SceneJS._loadModule._updateSceneJSLoads()", 100);
                //                }
            });

    /* When scene created, define a map of library assets for it
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_CREATED,
            function(params) {
                sceneLibraries[params.sceneId] = {};
            });


    /* When scene activated, activate the current scene library
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function(params) {
                sceneLibrary = sceneLibraries[params.sceneId];
            });

    /* When canvas activated, render the library's assets to define their Symbols.
     * Note we must have a canvas, so we can drive WebGL
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function() {
                var dummyTraversalContext = {};
                var dummyData = new SceneJS.Data(null, false, {});
                for (var key in sceneLibrary) {
                    if (sceneLibrary.hasOwnProperty(key)) {
                        var asset = sceneLibrary[key];
                        if (asset.status == SceneJS.Asset.STATUS_LOADED) {
                            asset.assetNode._render(dummyTraversalContext, dummyData);
                        }
                    }
                }
            }, 10000);

    /* When scene destroyed, destroy its library assets
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_DESTROYED,
            function(params) {
                sceneLibraries[params.sceneId] = null;
            });

    /**
     * Periodically called to update statii of assets, reaps those that have failed
     * @private
     */
    this._updateSceneJSLoads = function() {
        var asset;
        for (var url in assets) { // TODO: remove from this list when loaded
            if (assets.hasOwnProperty(url)) {
                asset = assets[url];
                if (asset) {
                    asset.poll();
                    if (asset.status == SceneJS.Asset.STATUS_ERROR ||
                        asset.status == SceneJS.Asset.STATUS_TIMED_OUT) {
                        assets[url] = null;
                    }
                }
            }
        }
    };

    /** Registers a parser function to handle a file of the given extension type
     */
    this.registerParser = function (fileExtension, parser) {
        parsers[fileExtension.toLowerCase()] = parser;
    };

    function getParserForURL(url) {
        var ext = url.split('.').pop();
        if (!ext) {
            return defaultParser;
        }
        return parsers[ext.toLowerCase()] || defaultParser;
    }

    var defaultParser = new (function() {
        this.parse = function(cfg) {
            if (cfg.data._render) {  // Cross-domain JSONP
                return cfg.data;
            }
            //        if (data.error) {
            //            cfg.onError(cfg.data.error);
            //        }
            try {
                var evalData = eval(cfg.data);  // Same-domain
                if (evalData.error) {           // TODO: This is specific to the old SceneJS proxy - remove?
                    // TODO: Throw
                    //cfg.onError(evalData.error);
                }
                return evalData;
            } catch (e) {
                cfg.onError(new SceneJS.errors.ParseException("Error parsing response: " + e));
            }
        };
        this.serverParams = {
            format: "json"
        };
    })();

    this.setLoadTimeoutSecs = function(loadTimeoutSecs) {
        defaultLoadTimeoutSecs = loadTimeoutSecs || 180;
    };

    /** Attempts to get currently-loaded asset, which may have been evicted
     */
    this.getAsset = function(uri) {
        var asset = assets[uri];
        if (asset && asset.status == SceneJS.Asset.STATUS_LOADED) {
            asset.lastUsed = time;
            return asset.assetNode;
        }
        return null;
    };

    /**
     * Triggers asynchronous JSONP load of asset, creates new process; callback
     * will fire with new child for the  client asset node. The asset node will have to then call assetLoaded
     * to notify the backend that the asset has loaded and allow backend to kill the process.
     *
     * JSON does not handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
     *
     * @private
     * @uri Location of asset
     * @loadTimeoutSecs Seconds after which response and parsing times out
     * @onLoaded Callback through which processed asset data is returned
     * @onTimeout Callback invoked when no response from proxy
     * @onError Callback invoked when error reported by proxy
     * @isLibrary True to indicate that asset is a library subgraph containing Symbols
     */
    this.loadAsset = function(uri, loadTimeoutSecs, onLoaded, onTimeout, onError, isLibrary) {
        uri = getBaseURL(uri);
        var asset = assets[uri];
        if (asset) {
            if (asset.status == SceneJS.Asset.STATUS_LOADING) {
                asset.addListener({ onLoaded : onLoaded, onTimeout: onTimeout, onError : onError });
            }
        } else {
            asset = new SceneJS.Asset({
                time: time,
                timeoutSecs: loadTimeoutSecs || defaultLoadTimeoutSecs,
                uri: uri,
                jsonpStrategy: jsonpStrategy,
                parser: getParserForURL(uri),
                onLoaded: onLoaded,
                onTimeout: onTimeout,
                onError: onError,
                isLibrary : isLibrary
            });
            assets[uri] = asset;
        }
        if (isLibrary) {

            /* Register library asset for rendering at the
             * beginning of next scene render as soon as it
             * is at status Asset.STATUS_LOADED, so that it
             * may render its Symbol nodes.
             */
            if (!sceneLibrary[uri]) {
                sceneLibrary[uri] = asset;
            }
        }
    };

    function getBaseURL(url) {
        var i = url.indexOf("#");
        return (i == -1) ? url : url.substr(0, i);
    }

    /**
     * @private
     */
    this.setJSONPStrategy = function(strategy) {
        jsonpStrategy = strategy;
    };

})();

/**
 * Configures SceneJS with a strategy to allow it to use a particular Web service to proxy cross-domain requests
 * by nodes such as {@link SceneJS.Instance} when their URIs are not in the local domain. As shown in the example below,
 * the strategy must implement two methods, one to create the request URL and another to extract a string of data
 * from the response.
 * <p><b>Example strategy- </b>specifying a JSONP handler for the Yahoo! Query Language (YQL) API:</p>
 * <pre><code>
 * SceneJS.setJSONPStrategy({
 *          request : function(url, format, callback) {
 *                  return "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20" + format + "%20where%20url='"
 *                                   + url + "'&format=" + format + "&callback=" + callback;
 *           },
 *
 *          response : function(data) {
 *                  return data.results[0];
 *          }
 *  });
 * </code></pre>
 * @param strategy {{request:function(url:String, format:String, callback:String), String response: function(data:String) }}
 */
SceneJS.setJSONPStrategy = function(strategy) {
    SceneJS._loadModule.setJSONPStrategy(strategy);
};


SceneJS.Asset = function(cfg) {
    this.timeoutSecs = cfg.timeoutSecs;
    this.lastUsed = cfg.time;
    this.uri = cfg.uri;
    this._listeners = [];
    this._jsonpStrategy = cfg.jsonpStrategy;
    this._parser = cfg.parser;
    this.assetNode = null;
    this.exception = null;
    this.addListener({ onLoaded: cfg.onLoaded, onError: cfg.onError, onTimeout: cfg.onTimeout });
    this.status = SceneJS.Asset.STATUS_LOADING;
    this.isLibrary = cfg.isLibrary;
    this._load();
};

SceneJS.Asset.STATUS_LOADING = 0;
SceneJS.Asset.STATUS_LOADED = 1;
SceneJS.Asset.STATUS_ERROR = 2;
SceneJS.Asset.STATUS_TIMED_OUT = 3;

SceneJS.Asset.prototype._load = function() {
    var description = this._jsonpStrategy
            ? "Instancing scene content cross-domain from " + this.uri
            : "Instancing scene content at local domain " + this.uri;
    SceneJS._loggingModule.debug(description);
    var self = this;
    this._process = SceneJS._processModule.createProcess({
        onTimeout: function() {  // process killed automatically on timeout
            self._handleTimeout();
        },
        description: description,
        timeoutSecs: this.timeoutSecs
    });
    if (this._jsonpStrategy) {
        this._loadCrossDomain();
    } else {
        this._loadLocal();
    }
};

SceneJS.Asset.prototype._loadCrossDomain = function() {
    var format = this._parser.serverParams ? (this._parser.serverParams.format || "json") : "json";
    var callbackName = "callback" + this._process.id;
    var fullUri = this._jsonpStrategy.request(this.uri, format, callbackName);
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    var self = this;
    window[callbackName] = function(data) {
        window[callbackName] = undefined;   // Remove callback
        try {
            delete window[callbackName];
        } catch(e) {
        }
        head.removeChild(script);          // Remove script
        try {
            data = self._jsonpStrategy.response(data);
        } catch (e) {
            self._handleException(new SceneJS.ProxyErrorResponseException(e));
            return;
        }
        self.assetNode = self._parser.parse({
            uri: self.uri,
            data: data,
            onError: function(msg) { ////////// TODO: Needed?
                self._handleException(new SceneJS.errors.EmptyResponseException(msg));
            }
        });
        if (this.status != SceneJS.Asset.STATUS_ERROR) {
            if (!self.assetNode) {
                self._handleException(new SceneJS.errors.InternalException("parser returned null result"));
            } else {              
                self._handleSuccess();
            }
        }
    };
    head.appendChild(script);
    script.src = fullUri;  // Sends request
};

SceneJS.Asset.prototype._loadLocal = function() {
    var request;
    try {
        request = new XMLHttpRequest();
        var self = this;
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (!request.responseText) {
                    self.handleError(new SceneJS.errors.EmptyResponseException("response content is empty"));
                } else {
                    self._assetNode = self._parser.parse({
                        data: request.responseText,
                        onError: function(msg) { ////////// TODO: Needed?
                            self._handleException(new SceneJS.errors.EmptyResponseException(msg));
                        }
                    });
                    if (this.status != SceneJS.Asset.STATUS_ERROR) {
                        if (!self._assetNode) {
                            self._handleException(new SceneJS.errors.InternalException("parser returned null result"));
                        } else {
                            self._handleSuccess();
                        }
                    }
                }
            }
        };
        request.open("GET", this._url, true);
        request.send(null);
    }
    catch (e) {
        this._handleException(new SceneJS.HttpException(request.status + " - " + e.toString()));
    }
};

SceneJS.Asset.prototype.addListener = function(listener) {
    this._listeners.push(listener);
};

SceneJS.Asset.prototype._handleException = function(e) {
    this.status = SceneJS.Asset.STATUS_ERROR;
    this.exception = e;
    if (this._process) {
        SceneJS._processModule.killProcess(this._process);
    }
};

SceneJS.Asset.prototype._handleSuccess = function() {
    this.status = SceneJS.Asset.STATUS_LOADED;
    SceneJS._processModule.killProcess(this._process);
};

SceneJS.Asset.prototype._handleTimeout = function() {
    this.status = SceneJS.Asset.STATUS_TIMED_OUT;
    if (this._jsonpStrategy) {
        SceneJS._loggingModule.error(
                "Load failed - timed out waiting for a reply from JSONP proxy for content at uri: " + this.uri);
    } else {
        SceneJS._loggingModule.error(
                "Load failed - timed out waiting for content at uri: " + this.uri);
    }
};

SceneJS.Asset.prototype.poll = function() {
    if (this.status == SceneJS.Asset.STATUS_LOADING) {
        return;
    }
    var listener;
    while (this._listeners.length > 0) {  // Removes listeners
        listener = this._listeners.pop();
        switch (this.status) {
            case SceneJS.Asset.STATUS_LOADED:
                if (listener.onLoaded) {
                    listener.onLoaded(this.assetNode);
                }
                break;
            case SceneJS.Asset.STATUS_ERROR:
                if (listener.onError) {
                    listener.onError(this.exception);
                }
                break;
            case SceneJS.Asset.STATUS_TIMED_OUT:
                if (listener.onTimeout) {
                    listener.onTimeout();
                }
                break;
        }
    }
};
