SceneJs.texture = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend("texture");

    var loading = false;
    return function(scope) {
        var params = cfg.getParams(scope);
        if (!params.uri) {
            throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory texture parameter missing: uri");
        }

        /* By default, texture will block rendering of its child nodes until it is loaded
         */
        if (params.wait == undefined) {
            params.wait = true;
        }
        var textureId = backend.getTexture(params.uri); // Backend may have evicted texture after lack of recent use

        if (!textureId && !loading) { // Load texture if we dont have one and we're not busy loading one
            loading = true;
            backend.loadTexture(
                    params.uri,
                    function(_textureId) { // Success
                        textureId = _textureId;
                    });
        } else if (textureId) { // Otherwise activate texture if we do have one
            if (loading) {
                backend.textureLoaded(textureId);    // And notify backend so it can kill the load process
                loading = false;
            }
            backend.activateTexture(textureId);
            SceneJs.utils.visitChildren(cfg, scope);
        } else if (!params.wait) {

            /* Texture configured to render children without texturing while the texture is still loading             
             */
            SceneJs.utils.visitChildren(cfg, scope);
        }
    };
};



