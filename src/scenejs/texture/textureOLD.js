(function() {

    var backend = SceneJS._backends.getBackend("texture");
    var logging = SceneJS._backends.getBackend("logging");


    const STATE_INITIAL = 0;            // Ready to get texture
    const STATE_IMAGE_LOADING = 2;      // Texture image load in progress
    const STATE_IMAGE_LOADED = 3;       // Texture image load completed
    const STATE_TEXTURE_CREATED = 4;    // Texture created
    const STATE_ERROR = -1;             // Image load or texture creation failed

    /** Pushes texture layer, renders children, then pops layer
     */
    function doTextureLayer(cfg, data, layer) {
        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
            SceneJS._utils.visitChildren(cfg, data);
        } else {
            backend.pushLayer(layer);
            SceneJS._utils.visitChildren(cfg, data);
            backend.popLayer();
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
        var layerParams;
        var process = null;   // Handle to asynchronous load process for texture configured with image url
        var image;
        var layer;

        return SceneJS._utils.createNode(
                function(data) {
                    if (!params) {
                        params = cfg.getParams(data);

                        if (!params.uri) {
                            throw new SceneJS.exceptions.WebGLNotSupportedException("Only uri is supported in textures in this version");
                        }

                        //ensureOneOf([params.uri, params.texels, params.image]);

                        if (params.wait == undefined) {  // By default, dont render children until texture loaded
                            params.wait = true;
                        }

                        if (params.applyTo) {
                            if (params.applyTo != "ambient" &&
                                params.applyTo != "diffuse" &&
                                params.applyTo != "specular" &&
                                params.applyTo != "shininess" &&
                                params.applyTo != "emission" &&
                                params.applyTo != "red" &&
                                params.applyTo != "green" &&
                                params.applyTo != "blue" &&
                                params.applyTo != "alpha" &&
                                params.applyTo != "normal" &&
                                params.applyTo != "height") {
                                throw SceneJS.exceptions.InvalidNodeConfigException(
                                        "SceneJS.texture node has an applyTo mode of unsupported type - " +
                                        "should be 'diffuse', 'specular', 'shininess', " +
                                        "'emission', 'red', 'green', " +
                                        "'blue', alpha', 'normal' or 'height'");
                            }
                        }

                        layerParams = {
                            applyTo: params.applyTo || "diffuse"
                        };
                    }

                    /* Backend may evict texture when not recently used,
                     * in which case we'll have to load it again
                     */
                    if (state == STATE_TEXTURE_CREATED) {
                        if (!backend.textureExists(layer.texture)) {
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
                        //                    doTextureLayer(cfg, data, textureId);
                    } else {

                        switch (state) {
                            case STATE_TEXTURE_CREATED: // Most frequent case, hopefully
                                doTextureLayer(cfg, data, layer);
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
                                    SceneJS._utils.visitChildren(cfg, data);  // Render children while image loading
                                }
                                break;

                            case STATE_IMAGE_LOADED:
                                params.image = image;
                                layer = {
                                    texture: backend.createTexture(params),
                                    params: layerParams
                                };
                                backend.imageLoaded(process);
                                state = STATE_TEXTURE_CREATED;
                                doTextureLayer(cfg, data, layer);
                                break;

                            case STATE_ERROR:
                                if (!params.wait) {
                                    SceneJS._utils.visitChildren(cfg, data);
                                }
                                break;
                        }
                    }
                });
    };
})();