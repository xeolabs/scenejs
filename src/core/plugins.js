/**
 * SceneJS plugin registry
 */
SceneJS.Plugins = new (function () {

    // Plugin map for each node type
    var nodePlugins = {};

    // Subscribers to plugins
    var pluginSubs = {};

    /**
     * Installs a plugin into SceneJS
     * @param {String} nodeType Node type name
     * @param {String} pluginType Plugin type name
     * @param [{String}] deps List of URLs of JavaScript files that the plugin depends on
     * @param {Function} plugin Plugin constructor
     */
    this.addPlugin = function () {
        var nodeType = arguments[0];
        var pluginType = arguments[1];
        var deps;
        var plugin;
        if (arguments.length == 4) {
            deps = arguments[2];
            plugin = arguments[3];
        } else {
            plugin = arguments[2];
        }
        addPlugin(nodeType, pluginType, deps, plugin);
    };

    function addPlugin(nodeType, pluginType, deps, plugin) {
        var plugins = nodePlugins[nodeType] || (nodePlugins[nodeType] = {});
        plugins[pluginType] = plugin;
        // Load dependencies, if any
        loadDeps(deps,
            0,
            function () {
                // Notify and unsubscribe subscribers
                var subId = nodeType + pluginType;
                var subs = pluginSubs[subId] || (pluginSubs[subId] = []);
                while (subs.length > 0) {
                    subs.pop()(plugin);
                }
                delete pluginSubs[subId];
            });
    }

    // Loads list of dependencies, synchronously and in order
    function loadDeps(deps, i, ok) {
        if (!deps || i >= deps.length) {
            ok();
            return;
        }
        var src = deps[i];
        var pluginPath = SceneJS_configsModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        src = pluginPath + "/" + src;
        loadScript(src,
            function () {
                loadDeps(deps, i + 1, ok);
            });
    }

    /**
     * Tests if given plugin is installed
     */
    this.hasPlugin = function (nodeType, pluginType) {
        var plugins = nodePlugins[nodeType];
        return (plugins && !!plugins[pluginType]);
    };

    /**
     * Returns installed plugin of given type and ID
     */
    this.getPlugin = function (nodeType, pluginType, ok) {
        var plugins = nodePlugins[nodeType];
        if (plugins) {
            var plugin = plugins[pluginType];
            if (plugin) {
                ok(plugin);
                return;
            }
        }
        var subId = nodeType + pluginType;
        var subs = pluginSubs[subId] || (pluginSubs[subId] = []);
        subs.push(ok);
        if (subs.length > 1) { // Not first sub
            return;
        }
        var self = this;
        var pluginPath = SceneJS_configsModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        var pluginFilePath = pluginPath + "/" + nodeType + "/" + pluginType + ".js";
        loadScript(pluginFilePath);
    };

    function loadScript(src, ok) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    if (ok) {
                        ok();
                    }
                }
            };
        } else {  //Others
            script.onload = function () {
                if (ok) {
                    ok();
                }
            };
        }
        script.src = src;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

})();