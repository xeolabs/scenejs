/**
 * SceneJS plugin registry
 */
SceneJS.Plugins = new (function() {

    this.GEO_SOURCE_PLUGIN = "geoSource";

    this.MORPH_GEO_SOURCE_PLUGIN = "morphGeoSource";

    this.TEXTURE_SOURCE_PLUGIN = "textureSource";

    this._pluginTypes = {};

    /**
     * Installs a plugin into SceneJS
     */
    this.addPlugin = function() {

        var type = arguments[0];
        var pluginId;
        var plugin;

        if (arguments.length == 2) {
            plugin = arguments[1];
        } else {
            pluginId = arguments[1];
            plugin = arguments[2];
        }

        var plugins = this._pluginTypes[type];
        if (!plugins) {
            plugins = this._pluginTypes[type] = {};
        }
        plugins[pluginId || "__default"] = plugin;
    };

    /**
     * Tests if plugin of given type and ID was installed
     */
    this.hasPlugin = function(type, pluginId) {
        var plugins = this._pluginTypes[type];
        return (plugins && !!plugins[pluginId || "__default"]);
    };

    /**
     * Returns installed plugin of given type and ID
     */
    this.getPlugin = function(type, pluginId) {
        var plugins = this._pluginTypes[type];
        if (!plugins) {
            return null;
        }
        return plugins[pluginId || "__default"];
    };

})();