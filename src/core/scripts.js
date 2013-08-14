/**
 * SceneJS script registry
 */
new (function () {

    // Loaded scripts
    var scripts = {};

    // Script subscribers
    var subs = {};

    /**
     * Loads a script into SceneJS
     * @param {String} src Script URL
     * @param {Function} ok Loaded callback
     */
    SceneJS.require = function (src, ok) {

        // Resolve relative to plugins directory
        var pluginPath = SceneJS_configsModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        src = pluginPath + "/" + src;

        if (scripts[src]) {
            ok();
            return;
        }
        var subs = subs[src] || (subs[src] = []);
        subs.push(ok);
        if (subs.length > 1) {

            loadScript(src,
                function () {
                    while (subs.length) {
                        subs.pop()();
                    }
                });
        }
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