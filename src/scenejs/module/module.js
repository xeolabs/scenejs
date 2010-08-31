new (function() {

    const TICK_INTERVAL = 50;
    const TIMEOUT = 60000; // 60 seconds

    var moduleQueue = [];
    var moduleLoading = null;
    var moduleLoadTimer = 0;

    /**
     * 
     * @param url
     */
    SceneJS.requireModule = function(url, install) {
        //    moduleQueue.unshift({ url : url + "&x=" + (new Date()).getTime() }); // defeat caching
        moduleQueue.unshift({ url : url , install: install });
    };

    /** Called by each module after it has eval-ed on arrival
     * @param json Module content
     */
    SceneJS.installModule = function(module) {
        if (moduleLoading) {
            try {
                if (module.init) {
                    module.init({});
                }

                /* Now we know where the module came from - prefix the URIs of
                 * it's Texture nodes with the module's location
                 */
                var node = module.getNode();
                fixImageURLs(node, SceneJS._getBaseURL(moduleLoading.url));
                if (moduleLoading.install) {
                    moduleLoading.install(node);
                }
            } catch (e) {
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.ModuleInstallFailureException(
                                "Module install failed - " + moduleLoading.url + ": " + e));
            } finally {
                moduleLoading = null;
            }
        }
    };

    function fixImageURLs(node, urlBase) {
        if (node) {
            if (node.type == "texture") {
                var cfg = node.cfg;
                if (cfg) {
                    var layers = cfg.layers;
                    if (layers) {
                        var layer;
                        for (var i = 0; i < layers.length; i++) {
                            layer = layers[i];
                            layer.uri = urlBase + layer.uri;
                        }
                    }
                }
            }
            var nodes = node.nodes;
            if (nodes) {
                for (var i = nodes.length; i >= 0; i--) {
                    fixImageURLs(nodes[i], urlBase);
                }
            }
        }
    }

    SceneJS._moduleLoadTicker = function() {
        if (moduleLoading) {
            if (moduleLoadTimer > TIMEOUT) {
                var url = moduleLoading.url;
                moduleLoading = null;
                moduleQueue = [];
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.ModuleLoadTimeoutException(
                                "Module load timed out - SceneJS.requireModule(" + url + ") - check console for more info"));
            }
            moduleLoadTimer += TICK_INTERVAL;
            return;
        }
        if (moduleQueue.length == 0) {
            return;
        }

        /* Load next module
         */
        moduleLoading = moduleQueue.pop();
        moduleLoadTimer = 0;

        var headID = document.getElementsByTagName("head")[0];
        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = moduleLoading.url;
        headID.appendChild(newScript);
    };
    window.setInterval(SceneJS._moduleLoadTicker, TICK_INTERVAL);
})();