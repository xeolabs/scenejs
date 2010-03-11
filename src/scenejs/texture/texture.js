(function() {

    var backend = SceneJS._backends.getBackend("texture");
    var logging = SceneJS._backends.getBackend("logging");

    const STATE_INITIAL = 0;            // Ready to get texture
    const STATE_IMAGE_LOADING = 2;      // Texture image load in progress
    const STATE_IMAGE_LOADED = 3;       // Texture image load completed
    const STATE_TEXTURE_CREATED = 4;    // Texture created
    const STATE_ERROR = -1;             // Image load or texture creation failed

    /** Activates texture, renders children, then restores previosuly active texture
     */
    function doTexture(cfg, scope, textureId) {
        var lastTexture = backend.getActiveTexture();
        backend.activateTexture(textureId);
        SceneJS._utils.visitChildren(cfg, scope);
        backend.deactivateTexture();
        if (lastTexture) {
            backend.activateTexture(lastTexture);
        }
    }

    /** Checks that only one texture source parameter is configured
     */
    function ensureOneOf(sourceParams) {
        var n = 0;
        for (var i = 0; i < sourceParams.length; i++) {
            if (sourceParams[i]) {
                n++;
            }
        }
        if (n == 0) {
            throw new SceneJS.exceptions.NodeConfigExpectedException
                    ("Mandatory texture node parameter missing - must have one of: uri, texels or image");
        }
        if (n > 1) {
            throw new SceneJS.exceptions.NodeConfigExpectedException
                    ("Texture node has more than one texture source - must have one of: uri, texels or image");
        }
    }

    SceneJS.texture = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
//        if (!cfg.fixed) {
//            throw new SceneJS.exceptions.UnsupportedOperationException
//                    ("Dynamic configuration of texture nodes is not supported");
//        }

        var state = STATE_INITIAL;
        var params;
        var process = null;             // Handle to asynchronous load process for texture configured with image url
        var textureId;
        var image;

        return SceneJS._utils.createNode(
                function(scope) {
                    if (!params) {
                        params = cfg.getParams(scope);

                        if (!params.uri) {
                            throw new SceneJS.exceptions.WebGLNotSupportedException("Only uri is supported in textures in this version");
                        }

                        //ensureOneOf([params.uri, params.texels, params.image]);

                        if (params.wait == undefined) {  // By default, dont render children until texture loaded
                            params.wait = true;
                        }
                    }

                    /* Backend may evict texture when not recently used,
                     * in which case we'll have to load it again
                     */
                    if (state == STATE_TEXTURE_CREATED) {
                        if (!backend.getTexture(textureId)) {
                            state = STATE_INITIAL;
                        }
                    }

                    if (!params.uri) {

                        //                    /* Trivial case: texture image/texels are supplied in configs,
                        //                     * so we can create and apply the texture immediately
                        //                     */
                        //                    if (!textureId) {
                        //                        textureId = backend.createTexture(params);
                        //                    }
                        //                    doTexture(cfg, scope, textureId);
                    } else {

                        switch (state) {
                            case STATE_TEXTURE_CREATED: // Most frequent case, hopefully
                                doTexture(cfg, scope, textureId);
                                break;

                            case STATE_INITIAL:
                                state = STATE_IMAGE_LOADING;
                                process = backend.loadImage(// Process killed automatically on error or abort
                                        params.uri,
                                        function(_image) {

                                            /* Image loaded successfully. Note that this callback will
                                             * be called in the idle period between render traversals (ie. scheduled by a
                                             * setInterval), so we're not actually visiting this node at this point. We'll
                                             * defer creation and application of the texture to the subsequent visit. We'll also defer
                                             * killing the load process to then so that we don't suddenly alter the list of
                                             * running scene processes during the idle period, when the list is likely to
                                             * be queried.
                                             */
                                            image = _image;
                                            state = STATE_IMAGE_LOADED;
                                        },
                                        function() {
                                            logging.getLogger().error("Texture image load failed: " + params.uri);
                                            state = STATE_ERROR;
                                        },
                                        function() {
                                            logging.getLogger().warn("Texture image load aborted: " + params.uri);
                                            state = STATE_ERROR;
                                        });
                                break;

                            case STATE_IMAGE_LOADING:
                                if (!params.wait) {
                                    SceneJS._utils.visitChildren(cfg, scope);  // Render children while image loading
                                }
                                break;

                            case STATE_IMAGE_LOADED:
                                params.image = image;
                                textureId = backend.createTexture(params);
                                backend.imageLoaded(process);
                                state = STATE_TEXTURE_CREATED;
                                doTexture(cfg, scope, textureId);
                                break;

                            case STATE_ERROR:
                                if (!params.wait) {
                                    SceneJS._utils.visitChildren(cfg, scope);
                                }
                                break;
                        }
                    }
                });
    };
})();