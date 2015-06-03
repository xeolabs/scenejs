/**
 * Backend that manages configurations.
 *
 * @class SceneJS_configsModule
 * @private
 */
var SceneJS_configsModule = new (function () {

    this.configs = {};
    var subs = {};

    /**
     * Set a config
     * @param path
     * @param data
     */
    this.setConfigs = function (path, data) {
        // Update configs
        if (!path) {
            this.configs = data;
        } else {
            var parts = path.split(".");
            var cfg = this.configs;
            var subCfg;
            var name;
            for (var i = 0; i < parts.length - 1; i++) {
                name = parts[i];
                subCfg = cfg[name];
                if (!subCfg) {
                    subCfg = cfg[name] = {};
                }
                cfg = subCfg;
            }
            cfg[parts.length - 1] = data;
        }
        // Notify subscribers
        var list = subs[path || "_all"];
        if (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                list[i](cfg);
            }
        }

        SceneJS.publish("configs", this.configs);
    };

    /**
     * Get a config
     * @param path
     * @return {*}
     */
    this.getConfigs = function (path) {
        if (!path) {
            return this.configs;
        } else {
            var cfg = this.configs;
            var parts = path.split(".");
            for (var i = 0; cfg && i < parts.length; i++) {
                cfg = cfg[parts[i]];
            }
            return (cfg != undefined) ? cfg : {};
        }
    };

    /**
     * Subscribe to updates to a config
     * @param path
     * @param ok
     */
    this.on = function (path, ok) {
        path = path || "_all";
        (subs[path] || (subs[path] = [])).push(ok);
        ok(this.getConfigs(path));
    };

})();

/** Sets configurations.
 */
SceneJS.configure = SceneJS.setConfigs = SceneJS.setDebugConfigs = function () {
    if (arguments.length == 1) {
        SceneJS_configsModule.setConfigs(null, arguments[0]);
    } else if (arguments.length == 2) {
        SceneJS_configsModule.setConfigs(arguments[0], arguments[1]);
    } else {
        throw SceneJS_error.fatalError("Illegal arguments given to SceneJS.setDebugs - should be either ({String}:name, {Object}:cfg) or ({Object}:cfg)");
    }
};

/** Gets configurations
 */
SceneJS.getConfigs = SceneJS.getDebugConfigs = function (path) {
    return SceneJS_configsModule.getConfigs(path);
};

