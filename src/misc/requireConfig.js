// Configure RequireJS to find plugins relative to plugins location
(function () {

    var pluginPath;

    SceneJS.on("configs",
        function (configs) {
            if (configs.pluginPath != pluginPath) {
                pluginPath = configs.pluginPath;
                var libPath = pluginPath + "/lib";
                
                require.config({
                    paths:{
                        "scenejsPluginDeps":libPath
                    }
                });
            }
        });
})();
