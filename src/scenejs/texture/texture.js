SceneJs.texture = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend("texture");
    var logger = SceneJs.backends.getBackend("logger");
    var params;
    var process = null;
    var loading = false;  // True while node is trying to load texture image
    var error = false;  // Node has given up trying to load when this true

    return function(scope) {
        if (!params) {
            params = cfg.getParams(scope);
            if (!params.uri) {
                throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory texture parameter missing: uri");
            }
            if (params.wait == undefined) {
                params.wait = true;   // By default, dont render children until texture loaded
            }
        }
        if (error) {
            if (!params.wait) {
                SceneJs.utils.visitChildren(cfg, scope); // Render children without texture
            }
        } else {
            var textureId = backend.getTexture(params.uri); // Backend may have evicted texture after lack of recent use
            if (!textureId && !loading) {
                process = backend.loadTexture(
                        params.uri,
                        function(_textureId) {      // onSuccess
                            textureId = _textureId;
                            loading = true;
                        },
                        function() {  // onError - backend kills process for us
                            error = true;
                            logger.getLogger().error("Texture load failed: " + params.uri);
                        },
                        function() {  // onAbort - user hits browser Stop button - backend kills process
                            error = true;
                            logger.getLogger().warn("Texture load aborted: " + params.uri);
                        });
            } else if (textureId) {
                if (loading) {  // Just loaded - notify backend, which kills process and binds texture
                    loading = false;
                    try {
                        backend.textureLoaded(process, textureId);
                    } catch (e) {
                        alert("texture: " + e);
                        var x;
                    }
                    process = null;

                }
                backend.activateTexture(textureId);
                SceneJs.utils.visitChildren(cfg, scope);
            } else if (!params.wait) {
                SceneJs.utils.visitChildren(cfg, scope);  // Render children while loading texture
            }
        }
    };
};



