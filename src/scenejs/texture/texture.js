(function() {

    /* Separate backends for texture and colour for simplicity
     */
    var textureBackend = SceneJS._backends.getBackend("texture");
    var logging = SceneJS._backends.getBackend("logging");

    const STATE_INITIAL = 0;            // Ready to get texture
    const STATE_IMAGE_LOADING = 2;      // Texture image load in progress
    const STATE_IMAGE_LOADED = 3;       // Texture image load completed
    const STATE_TEXTURE_CREATED = 4;    // Texture created
    const STATE_ERROR = -1;             // Image load or texture creation failed

    SceneJS.texture = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var params;
        var layers = [];

        return SceneJS._utils.createNode(
                function(data) {

                    /* Node can be dynamically configured, but only once
                     */
                    if (!params) {
                        params = cfg.getParams(data);

                         if (!params.layers) {
                                throw new SceneJS.exceptions.NodeConfigExpectedException(
                                        "SceneJS.texture.layers is undefined");
                            }

                        params.layers = params.layers || [];

                        /* Prepare texture layers from params
                         */
                        for (var i = 0; i < params.layers.length; i++) {

                            var layerParam = params.layers[i];

                            if (!layerParam.uri) {
                                throw new SceneJS.exceptions.NodeConfigExpectedException(
                                        "SceneJS.texture.layers[" + i + "].uri is undefined");
                            }

                            if (layerParam.applyTo) {
                                if (layerParam.applyTo != "ambient" &&
                                    layerParam.applyTo != "diffuse" &&
                                    layerParam.applyTo != "specular" &&
                                    layerParam.applyTo != "shininess" &&
                                    layerParam.applyTo != "emission" &&
                                    layerParam.applyTo != "red" &&
                                    layerParam.applyTo != "green" &&
                                    layerParam.applyTo != "blue" &&
                                    layerParam.applyTo != "alpha" &&
                                    layerParam.applyTo != "normal" &&
                                    layerParam.applyTo != "height") {

                                    throw SceneJS.exceptions.InvalidNodeConfigException(
                                            "SceneJS.texture.layers[" + i + "].applyTo is unsupported - " +
                                            "should be either 'diffuse', 'specular', 'shininess', " +
                                            "'emission', 'red', 'green', " +
                                            "'blue', alpha', 'normal' or 'height'");
                                }
                            }

                            layers.push({
                                state : STATE_INITIAL,
                                process: null,                  // Imageload process handle
                                image : null,                   // Initialised when state == IMAGE_LOADED
                                creationParams: layerParam,   // Create texture using this

                                /* The layer that gets exported
                                 */

                                texture: null,          // Initialised when state == TEXTURE_LOADED
                                applyParams : {         //
                                    applyTo: layerParam.applyTo || "diffuse"
                                }
                            });
                        }
                    }

                    /* Update state of each texture layer and
                     * count how many are created and ready to apply
                     */
                    var countLayersReady = 0;

                    for (var i = 0; i < layers.length; i++) {
                        var layer = layers[i];

                        /* Backend may evict texture when not recently used,
                         * in which case we'll have to load it again
                         */
                        if (layer.state == STATE_TEXTURE_CREATED) {
                            if (!textureBackend.textureExists(layer.texture)) {
                                layer.state = STATE_INITIAL;
                            }
                        }

                        switch (layer.state) {
                            case STATE_TEXTURE_CREATED:
                                countLayersReady++;
                                break;

                            case STATE_INITIAL:

                                /* Start loading image for this texture layer.
                                 *
                                 * Do it in a new closure so that the right layer gets the process result.
                                 */
                                (function(_layer) {
                                    _layer.state = STATE_IMAGE_LOADING;
                                    _layer.process = textureBackend.loadImage(// Process killed automatically on error or abort
                                            _layer.creationParams.uri,
                                            function(_image) {

                                                /* Image loaded successfully. Note that this callback will
                                                 * be called in the idle period between render traversals (ie. scheduled by a
                                                 * setInterval), so we're not actually visiting this node at this point. We'll
                                                 * defer creation and application of the texture to the subsequent visit. We'll also defer
                                                 * killing the load process to then so that we don't suddenly alter the list of
                                                 * running scene processes during the idle period, when the list is likely to
                                                 * be queried.
                                                 */
                                                _layer.image = _image;
                                                _layer.state = STATE_IMAGE_LOADED;
                                            },

                                            /* General error, probably a 404
                                             */
                                            function() {
                                                logging.getLogger().error("SceneJS.texture image load failed: "
                                                        + _layer.creationParams.uri);
                                                _layer.state = STATE_ERROR;
                                            },

                                            /* Load aborted - eg. user stopped browser
                                             */
                                            function() {
                                                logging.getLogger().warn("SceneJS.texture image load aborted: "
                                                        + _layer.creationParams.uri);
                                                _layer.state = STATE_ERROR;
                                            });
                                })(layer);
                                break;

                            case STATE_IMAGE_LOADING:

                                /* Continue loading this texture layer
                                 */
                                break;

                            case STATE_IMAGE_LOADED:

                                /* Create this texture layer
                                 */
                                layer.texture = textureBackend.createTexture(layer.image, layer.creationParams);
                                    layer.applyParams.image = layer.image;
                                textureBackend.imageLoaded(layer.process);
                                layer.state = STATE_TEXTURE_CREATED;
                                countLayersReady++;
                                break;

                            case STATE_ERROR:

                                /* Give up on this texture layer, but we'll keep updating the others
                                 * to at least allow diagnostics to log
                                 */
                                break;
                        }
                    }

                    if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {

                        /* Dont apply textures if picking
                         */
                        SceneJS._utils.visitChildren(cfg, data);

                    } else {

                        if (countLayersReady == layers.length) {
                            for (var i = 0; i < layers.length; i++) {
                                var layer = layers[i];
                                textureBackend.pushLayer(layer.texture, layer.applyParams);
                            }
                            SceneJS._utils.visitChildren(cfg, data);
                            for (var i = 0; i < layers.length; i++) {
                                textureBackend.popLayer();
                            }
                        }
                    }
                }
                );
    };
})();