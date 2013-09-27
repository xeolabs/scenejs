// Configure RequireJS to find plugins relative to plugins location
(function () {

    var pluginPath;

    SceneJS.on("configs",
        function (configs) {
            if (configs.pluginPath != pluginPath) {
                pluginPath = configs.pluginPath;
                var libPath = pluginPath + "/lib";
                
                // don't steamroller over existing requirejs config if its there
                var _config = requirejs.s.contexts._.config || {};
                _config.paths["scenejsPluginDeps"] = libPath;

                require.config(_config);
            }
        });
})();
