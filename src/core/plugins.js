/**
 * SceneJS plugin registry
 */
SceneJS.Plugins = new (function () {

    this._nodePlugins = {};

    /**
     * Installs a plugin into SceneJS
     */
    this.addPlugin = function (nodeType, pluginType, plugin) {
        var plugins = this._nodePlugins[nodeType] || (this._nodePlugins[nodeType] = {});
        plugins[pluginType] = plugin;
    };

    /**
     * Tests if given plugin is installed
     */
    this.hasPlugin = function (nodeType, pluginType) {
        var plugins = this._nodePlugins[nodeType];
        return (plugins && !!plugins[pluginType]);
    };

    /**
     * Returns installed plugin of given type and ID
     */
    this.getPlugin = function (nodeType, pluginType, ok) {
        var plugins = this._nodePlugins[nodeType];
        if (plugins) {
            var plugin = plugins[pluginType];
            if (plugin) {
                ok(plugin);
            }
        }
        // lazy-load
        var self = this;
        var pluginPath = SceneJS_debugModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        loadScript(pluginPath + "/" + nodeType + "/" + pluginType + ".js",
            function () {
                ok(self._nodePlugins[nodeType][pluginType]);
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