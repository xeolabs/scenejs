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
     */
    this.addPlugin = function (nodeType, pluginType, plugin) {
        var plugins = nodePlugins[nodeType] || (nodePlugins[nodeType] = {});
        plugins[pluginType] = plugin;
    };

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
        var pluginPath = SceneJS_debugModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        var pluginFilePath = pluginPath + "/" + nodeType + "/" + pluginType + ".js";
        loadScript(pluginFilePath,
            function () {
                var plugin = nodePlugins[nodeType][pluginType];
                if (!plugin) {
                    // Plugin was not registered correctly
                    throw "Problem in plugin file '" + pluginFilePath + "': call to addPlugin(nodeType, pluginType, ..) : either or both args have incorrect value";
                }
                while (subs.length > 0) {
                    subs.pop()(plugin);
                }
                delete pluginSubs[subId];
            });
    };

    function loadScript(url, ok) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    ok();
                }
            };
        } else {  //Others
            script.onload = function () {
                ok();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

})();