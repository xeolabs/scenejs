(function() {

    var utils = SceneJS.__texture = {   // Just one object in closure

        textureBackend : SceneJS._backends.getBackend("texture"),
        loggingBackend : SceneJS._backends.getBackend("logging"),

        getMatrix: function(translate, rotate, scale) {
            var matrix = null;
            var t;
            if (translate) {
                matrix = SceneJS._math.translationMat4v([ translate.x || 0, translate.y || 0, translate.z || 0]);
            }
            if (scale) {
                t = SceneJS._math.scalingMat4v([ scale.x || 1, scale.y || 1, scale.z || 1]);
                matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
            }
            if (rotate) {
                if (rotate.x) {
                    t = SceneJS._math.rotationMat4v(rotate.x * 0.0174532925, [1,0,0]);
                    matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
                }
                if (rotate.y) {
                    t = SceneJS._math.rotationMat4v(rotate.y * 0.0174532925, [0,1,0]);
                    matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
                }
                if (rotate.z) {
                    t = SceneJS._math.rotationMat4v(rotate.z * 0.0174532925, [0,0,1]);
                    matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
                }
            }
            return matrix;
        },

        STATE_INITIAL : 0,            // Ready to get texture
        STATE_IMAGE_LOADING : 2,      // Texture image load in progress
        STATE_IMAGE_LOADED : 3,       // Texture image load completed
        STATE_TEXTURE_CREATED : 4,    // Texture created
        STATE_ERROR : -1             // Image load or texture creation failed
    };

    SceneJS.texture = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var params;
        var layers = [];
        var matrix;

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

                            //                            var lp = new SceneJS._utils.NodeParams("", layerParam, data);
                            //                            var scale = lp.getParam("scale", data);
                            //                            var translate = lp.getParam("translate", data);
                            //                            var rotate = lp.getParam("rotate", data);
                            //
                            layers.push({
                                state : utils.STATE_INITIAL,
                                process: null,                  // Imageload process handle
                                image : null,                   // Initialised when state == IMAGE_LOADED
                                creationParams: layerParam,   // Create texture using this

                                /* The layer that gets exported
                                 */
                                //
                                //                                getMatrix : new (function() {
                                //                                    var translate = layerParam.translate;
                                //                                    var rotate = layerParam.rotate;
                                //                                    var scale = layerParam.scale;
                                //                                    return function(data) {
                                //                                        return utils.getMatrix(
                                //                                                (translate instanceof Function) ? translate(data) : translate,
                                //                                                (rotate instanceof Function) ? rotate(data) : rotate,
                                //                                                (scale instanceof Function) ? scale(data) : scale);
                                //                                    };
                                //                                })(),

                                texture: null,          // Initialised when state == TEXTURE_LOADED
                                createMatrix : new (function() {
                                    var translate = layerParam.translate;
                                    var rotate = layerParam.rotate;
                                    var scale = layerParam.scale;
                                    var dynamic = ((translate instanceof Function) ||
                                                 (rotate instanceof Function) ||
                                                 (scale instanceof Function));
                                    var defined = dynamic || translate || rotate || scale;
                                    return function(data) {
                                        if (defined && (dynamic || !matrix)) {
                                            matrix = utils.getMatrix(
                                                    (translate instanceof Function) ? translate(data) : translate,
                                                    (rotate instanceof Function) ? rotate(data) : rotate,
                                                    (scale instanceof Function) ? scale(data) : scale);
                                        }
                                        return matrix;
                                    };
                                })(),
                                applyTo: layerParam.applyTo // Optional - colour map my default
                                //matrix: utils.getMatrix(layerParam.translate, layerParam.rotate, layerParam.scale)

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
                        if (layer.state == utils.STATE_TEXTURE_CREATED) {
                            if (!utils.textureBackend.textureExists(layer.texture)) {
                                layer.state = utils.STATE_INITIAL;
                            }
                        }

                        switch (layer.state) {
                            case utils.STATE_TEXTURE_CREATED:
                                countLayersReady++;
                                break;

                            case utils.STATE_INITIAL:

                                /* Start loading image for this texture layer.
                                 *
                                 * Do it in a new closure so that the right layer gets the process result.
                                 */
                                (function(_layer) {
                                    _layer.state = utils.STATE_IMAGE_LOADING;


                                    _layer.process = utils.textureBackend.loadImage(// Process killed automatically on error or abort
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
                                                _layer.state = utils.STATE_IMAGE_LOADED;
                                            },

                                        /* General error, probably a 404
                                         */
                                            function() {
                                                utils.loggingBackend.getLogger().error("SceneJS.texture image load failed: "
                                                        + _layer.creationParams.uri);
                                                _layer.state = utils.STATE_ERROR;
                                            },

                                        /* Load aborted - eg. user stopped browser
                                         */
                                            function() {
                                                utils.loggingBackend.getLogger().warn("SceneJS.texture image load aborted: "
                                                        + _layer.creationParams.uri);
                                                _layer.state = utils.STATE_ERROR;
                                            });
                                })(layer);
                                break;

                            case utils.STATE_IMAGE_LOADING:

                                /* Continue loading this texture layer
                                 */
                                break;

                            case utils.STATE_IMAGE_LOADED:

                                /* Create this texture layer
                                 */
                                layer.texture = utils.textureBackend.createTexture(layer.image, layer.creationParams);
                                utils.textureBackend.imageLoaded(layer.process);
                                layer.state = utils.STATE_TEXTURE_CREATED;
                                countLayersReady++;
                                break;

                            case utils.STATE_ERROR:

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
                                utils.textureBackend.pushLayer(layer.texture, {
                                    applyTo : layer.applyTo,
                                    //    image: layer.image,
                                    matrix: layer.createMatrix()
                                });
                            }
                            SceneJS._utils.visitChildren(cfg, data);
                            utils.textureBackend.popLayers(layers.length);

                        }
                    }
                }
                );
    };
})();