SceneJS.texture = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of texture nodes is not supported");
    }

    var backend = SceneJS._backends.getBackend("texture");
    var logging = SceneJS._backends.getBackend("logging");
    var params;
    var process = null;             // Handle to asynchronous load process for texture configured with image url
    var imageLoading = false;       // True while texture node is loading texture image
    var imageLoadFailed = false;    // Node has given up trying to load image when this true


    /** Activates texture, renders children, then restores previosuly active texture
     */
    function doTexture(textureId) {
        var lastTexture = backend.getActiveTexture();
        backend.activateTexture(textureId);
        SceneJS._utils.visitChildren(cfg, scope);
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

    return SceneJS._utils.createNode(

            function(scope) {

                if (!params) {
                    params = cfg.getParams(scope);

                    ensureOneOf([params.uri, params.texels, params.image]);

                    if (params.wait == undefined) {  // By default, dont render children until texture loaded
                        params.wait = true;
                    }
                }

                var textureId = backend.getTexture(params.uri); // Backend may have evicted texture after lack use

                if (!params.uri) {

                    /* Trivial case: texture image/texels are supplied in configs,
                     * so we can create and apply the texture immediately
                     */
                    if (!textureId) {
                        textureId = backend.createTexture(params);
                    }
                    doTexture(textureId);

                } else {

                    /* Trickier case: texture image URI supplied in configs, so we
                     * must do a two-step process to load then apply it. On this node visit,
                     * we'll start an asynchronous process to get the load underway, then on
                     * future visits we'll check to see if the load has completed, at which
                     * point we'll kill the process and begin applying the texture.
                     */
                    if (imageLoadFailed) {

                        /* If load failed last time then stop trying in vain to load
                         */
                        if (!params.wait) {

                            /* If we were rendering children while waiting for the load,
                             * then render them without a texture.
                             */
                            SceneJS._utils.visitChildren(cfg, scope);
                        }
                    } else {
                        if (!textureId && !imageLoading) {

                            /* Start the load process
                             */
                            imageLoading = true;
                            process = backend.loadImage(
                                    params.uri,
                                    function() {

                                        /* Image loaded successfully - create the texture. Note that this callback will
                                         * be called in the idle period between render traversals (ie. scheduled by a
                                         * setInterval), so we're not actually visiting this node at this point. We'll
                                         * defer application of the texture to the subsequent visit. We'll also defer
                                         * killing the load process to then so that we don't suddenly alter the list of
                                         * running scene processes during the idle period, when the list is likely to
                                         * be queried. 
                                         */
                                        textureId = backend.createTexture(params);
                                    },
                                    function() {

                                        /* Image load failed - backend kills process for us. We'll flag the failed
                                         * load so we don't keep trying.
                                         */
                                        imageLoadFailed = true;
                                        logging.getLogger().error("Texture image load failed: " + params.uri);
                                    },
                                    function() {

                                        /* Image load aborted - backend kills process for us. Flag the load as failed.
                                         */
                                        imageLoadFailed = true;
                                        logging.getLogger().warn("Texture image load aborted: " + params.uri);
                                    });

                        } else if (textureId) {

                            /* Texture exists, image loaded
                             */
                            if (imageLoading) {

                                /* Subsequent visit after image loaded successfully and texture created.
                                 * Get backend to kill the load process.
                                 */
                                imageLoading = false;
                                backend.imageLoaded(process);
                                process = null;
                            }

                            /* Apply texture and render children
                             */
                            doTexture(textureId);

                        } else if (!params.wait) {

                            SceneJS._utils.visitChildren(cfg, scope);  // Render children while image loading
                        }
                    }
                }
            });
};



