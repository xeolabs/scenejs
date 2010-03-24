/**
 * Backend module that services the SceneJS.withPlugin nodes to manage the asynchronous cross-domain
 * load and caching of remotely-stored SceneJS plugins.
 *
 * Very similar to the "load" backend, except that plugin has a fixed format and provides its own ID.
 *
 * Uses the memory management backend to mediate cache management.
 */
SceneJS._backends.installBackend(

        "plugins",

        function(ctx) {

            var time = (new Date()).getTime();
            var plugins = {};                        // Nodes created by parsers, cached against file name
            var pluginIds = {};

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        plugins = {};
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

            /** Loads plugin and caches it against uri
             */
            function _loadPlugin(uri, proxy, serverParams, callbackName, onSuccess, onError) {
                var url = [proxy, "?callback=", callbackName , "&uri=" + uri];
                for (var param in serverParams) {
                    url.push("&", param, "=", serverParams[param]);
                }

                /* Request the plugin
                 */
                jsonp(url.join(""),
                        callbackName,

                    /* Handle response
                     */
                        function(plugin) {
                            if (!plugin) {
                                onError("server response is empty");
                            } else {

                                /* If plugin with same ID already exists, then just reuse that. It's rather
                                 * inefficient to go to all the trouble of loading to find this out, but there's
                                 * not much else we can do.
                                 */
                                var p = pluginIds[plugin.id];
                                if (p) {
                                    onSuccess(p.url);
                                } else {

                                    /* Invoke plugin's optional install function
                                     */
                                    if (plugin.install) {
                                        try {
                                            plugin.install();
                                        } catch (e) {
                                            onError("Installation of plugin from " + uri + " failed: " + e || e.message);
                                            return;
                                        }
                                    }

                                    if (!plugin.id || pluginIds[plugin.id]) {
                                        plugins[uri] = {
                                            plugin : plugin,
                                            lastUsed: time
                                        };
                                    }

                                    /* Notify the node
                                     */
                                    onSuccess();
                                }
                            }
                        });
            }

            return { // Node-facing API

                /**
                 * Queries whether the plugin from the given URI is currently loaded or not. In the latter case the
                 * node then needs to call loadPlugin to load it.
                 */
                pluginLoaded : function(uri) {
                    return (plugins[uri]) ? true : false;
                },

                /**
                 * Triggers asynchronous JSONP load of plugin and creates new process; callback will fire with a
                 * unique ID for the plugin. The node will have to then call pluginLoaded to notify the backend that the
                 * plugin has loaded and allow backend to kill the process.
                 *
                 * JSON does not handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
                 *
                 * @uri Location of plugin
                 * @proxy Location of JSONP proxy
                 * @serverParams Request parameters for proxy
                 * @onSuccess Callback through which processed asset data is returned
                 * @onTimeout Callback invoked when no response from proxy
                 * @onError Callback invoked when error reported by proxy
                 */
                loadPlugin : function(uri, proxy, serverParams, onSuccess, onTimeout, onError) {
                    ctx.logging.debug("Loading asset from " + uri);
                    var process = ctx.processes.createProcess({
                        onTimeout: function() {  // process killed automatically on timeout
                            onTimeout();
                        },
                        description:"plugin load from " + uri
                    });
                    var callbackName = "callback" + process.id; // Process ID is globally unique
                    _loadPlugin(
                            uri,
                            proxy,
                            serverParams,
                            callbackName,
                            onSuccess,
                            function(msg) {  // onError
                                ctx.processes.destroyProcess(process);
                                onError(msg);
                            });
                    return process;
                },

                /** Notifies backend that load has completed; backend then kills the process.
                 */
                pluginLoaded : function(process) {
                    ctx.processes.destroyProcess(process);
                }
            };
        });