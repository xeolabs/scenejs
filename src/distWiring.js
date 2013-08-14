//SceneJS.configure({ pluginPath: "http://xeolabs.github.com/scenejs/api/latest/plugins" });
SceneJS.configure({ pluginPath: "/home/lindsay/xeolabs/projects/scenejs3.0/api/latest/plugins" });

// Slave RequireJS base URL to plugin path config
// The plugin path must not change while plugins are still loading, because some plugins will
// load RequireJS modules relative to the path.
SceneJS_configsModule.on("pluginPath",
    function (pluginPath) {
        requirejs.config({
            baseUrl: pluginPath
//                ,
//                //except, if the module ID starts with "app",
//                //load it from the js/app directory. paths
//                //config is relative to the baseUrl, and
//                //never includes a ".js" extension since
//                //the paths config could be for a directory.
//                paths: {
//                    app: '../app'
//                }
        });
    });