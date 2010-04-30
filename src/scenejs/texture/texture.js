/**
 * @class SceneJS.texture
 * @extends SceneJS.node
 *
 * <p>Scene node that defines one or more layers of texture to apply to all geometries within its subgraph that have UV coordinates.</p>
 * <p>Texture layers are applied to specified material reflection cooficients, and may be transformed.</p>
 * <p><b>Example 1</b></p>
 * <p>A cube wrapped with a material which specifies its base (diffuse) color coefficient, and a texture with
 * one layer which applies a texture image to that particular coefficient. The texture is also translated, scaled and
 * rotated, in that order. All the texture properties are specified here to show what they are. </p>
 *  <pre><code>
 * var subGraph =
 *       new SceneJS.Material({
 *           baseColor: { r: 1.0, g: 1.0, b: 1.0 }
 *       },
 *               new SceneJS.Texture({
 *                   layers: [
 *                       {
 *                           // Only the image URI is mandatory:
 *
 *                           uri:"http://scenejs.org/library/textures/misc/general-zod.jpg",
 *
 *                          // Optional params:
 *
 *                           minFilter: "linear",                   // Options are ”nearest”, “linear” (default), “nearestMipMapNearest”,
 *                                                                  //        ”nearestMipMapLinear” or “linearMipMapLinear”
 *                           magFilter: "linear",                   // Options are “nearest” or “linear” (default)
 *                           wrapS: "repeat",                       // Options are “clampToEdge” (default) or “repeat”
 *                           wrapT: "repeat",                       // Options are "clampToEdge” (default) or “repeat”
 *                           isDepth: false,                        // Options are false (default) or true
 *                           depthMode:"luminance"                  // (default)
 *                           depthCompareMode: "compareRToTexture", // (default)
 *                           depthCompareFunc: "lequal",            // (default)
 *                           flipY: false,                          // Options are true (default) or false
 *                           width: 1,
 *                           height: 1,
 *                           internalFormat:"lequal",               // (default)
 *                           sourceFormat:"alpha",                  // (default)
 *                           sourceType: "unsignedByte",            // (default)
 *                           applyTo:"baseColor",                   // Options so far are “baseColor” (default) or “diffuseColor”
 *
 *                           // Optional transforms - these can also be functions, as shown in the next example
 *
 *                           rotate: {      // Currently textures are 2-D, so only rotation about Z makes sense
 *                               z: 45.0
 *                           },
 *
 *                           translate : {
 *                               x: 10,
 *                               y: 0,
 *                               z: 0
 *                           },
 *
 *                           scale : {
 *                               x: 1,
 *                               y: 2,
 *                               z: 1
 *                           }
 *                       }
 *                   ]
 *               },
 *
 *               new SceneJS.objects.Cube()
 *           )
 *     );
 *  </code></pre>
 *
 * <p><b>Example 2</b></p>
 * <p>You can animate texture transformations - this example shows how the rotate, scale and translate properties
 * can be functions to take their values from the data scope, in this case created by a higher WithData node:</p>
 *  <pre><code>
 * var subGraph =
 *       new SceneJS.WithData({
 *           angle: 45.0   // Vary this value to rotate the texture
 *       },
 *               new SceneJS.Texture({
 *                   layers: [
 *                       {
 *                           uri:"http://scenejs.org/library/textures/misc/general-zod.jpg",
 *
 *                           rotate: function(data) {
 *                               return { z: data.get("angle") }
 *                           }
 *                       }
 *                   ]
 *               },
 *               new SceneJS.objects.Cube()
 *         )
 *   );
 *  </code></pre>
 * @constructor
 * Create a new SceneJS.texture
 * @param {Object} The config object or function, followed by zero or more child nodes
 */
SceneJS.Texture = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "texture";
    this._layers = null;
};

SceneJS._utils.inherit(SceneJS.Texture, SceneJS.Node);

// @private
SceneJS.Texture.prototype._getMatrix = function(translate, rotate, scale) {
    var matrix = null;
    var t;
    if (translate) {
        matrix = SceneJS_math_translationMat4v([ translate.x || 0, translate.y || 0, translate.z || 0]);
    }
    if (scale) {
        t = SceneJS_math_scalingMat4v([ scale.x || 1, scale.y || 1, scale.z || 1]);
        matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
    }
    if (rotate) {
        if (rotate.x) {
            t = SceneJS_math_rotationMat4v(rotate.x * 0.0174532925, [1,0,0]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (rotate.y) {
            t = SceneJS_math_rotationMat4v(rotate.y * 0.0174532925, [0,1,0]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (rotate.z) {
            t = SceneJS_math_rotationMat4v(rotate.z * 0.0174532925, [0,0,1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
    }
    return matrix;
};

SceneJS.Texture.prototype._STATE_INITIAL = 0;            // Ready to get texture
SceneJS.Texture.prototype._STATE_IMAGE_LOADING = 2;      // Texture image load in progress
SceneJS.Texture.prototype._STATE_IMAGE_LOADED = 3;       // Texture image load completed
SceneJS.Texture.prototype._STATE_TEXTURE_CREATED = 4;    // Texture created
SceneJS.Texture.prototype._STATE_ERROR = -1;             // Image load or texture creation failed

SceneJS.Texture.prototype._render = function(traversalContext, data) {
    if (!this._layers) { // One-shot dynamic config
        this._layers = [];
        var params = this._getParams(data);
        if (!params.layers) {
            throw new SceneJS.exceptions.NodeConfigExpectedException(
                    "SceneJS.Texture.layers is undefined");
        }
        for (var i = 0; i < params.layers.length; i++) {
            var layerParam = params.layers[i];
            if (!layerParam.uri) {
                throw new SceneJS.exceptions.NodeConfigExpectedException(
                        "SceneJS.Texture.layers[" + i + "].uri is undefined");
            }
            if (layerParam.applyFrom) {
                if (layerParam.applyFrom != "uv" &&
                    layerParam.applyFrom != "uv2" &&
                    layerParam.applyFrom != "normal" &&
                    layerParam.applyFrom != "geometry") {
                    SceneJS_errorModule.fatalError(
                            new SceneJS.exceptions.InvalidNodeConfigException(
                                    "SceneJS.Texture.layers[" + i + "].applyFrom value is unsupported - " +
                                    "should be either 'uv', 'uv2', 'normal' or 'geometry'"));
                }
            }
            if (layerParam.applyTo) {
                if (layerParam.applyTo != "baseColor" && // Colour map
                    layerParam.applyTo != "diffuseColor") {
                    SceneJS_errorModule.fatalError(
                            new SceneJS.exceptions.InvalidNodeConfigException(
                                    "SceneJS.Texture.layers[" + i + "].applyTo value is unsupported - " +
                                    "should be either 'baseColor', 'diffuseColor'"));
                }
            }

            this._layers.push({
                state : this._STATE_INITIAL,
                process: null,                      // Image load process handle
                image : null,                       // Initialised when state == IMAGE_LOADED
                creationParams: layerParam,         // Create texture using this
                texture: null,                      // Initialised when state == TEXTURE_LOADED
                createMatrix : new (function() {
                    var translate = layerParam.translate;
                    var rotate = layerParam.rotate;
                    var scale = layerParam.scale;
                    var dynamic = ((translate instanceof Function) ||
                                   (rotate instanceof Function) ||
                                   (scale instanceof Function));
                    var defined = dynamic || translate || rotate || scale;
                    return function(data) {
                        var matrix = null;
                        if (defined && (dynamic || !matrix)) {
                            matrix = SceneJS.Texture.prototype._getMatrix(
                                    (translate instanceof Function) ? translate(data) : translate,
                                    (rotate instanceof Function) ? rotate(data) : rotate,
                                    (scale instanceof Function) ? scale(data) : scale);
                        }
                        return matrix;
                    };
                })(),
                applyFrom: layerParam.applyFrom || "uv",
                applyTo: layerParam.applyTo || "baseColor",
                blendMode: layerParam.blendMode || "multiply"
            });
        }
    }

    /* Update state of each texture layer and
     * count how many are created and ready to apply
     */
    var countLayersReady = 0;
    for (var i = 0; i < this._layers.length; i++) {
        var layer = this._layers[i];
        if (layer.state == this._STATE_TEXTURE_CREATED) {
            if (!SceneJS_textureModule.textureExists(layer.texture)) {  // Texture evicted from cache
                layer.state = this._STATE_INITIAL;
            }
        }
        switch (layer.state) {
            case this._STATE_TEXTURE_CREATED:
                countLayersReady++;
                break;

            case this._STATE_INITIAL:

                /* Start loading image - in a new closure so that the right layer gets the process result.
                 */
                (function(l) {
                    var _this = this;
                    l.state = this._STATE_IMAGE_LOADING;

                    /* Logging each image load slows things down a lot
                     */
                    // loggingBackend.getLogger().info("SceneJS.texture image loading: "
                    //  + _layer.creationParams.uri);

                    SceneJS_textureModule.loadImage(
                            l.creationParams.uri,
                            function(_image) {

                                /* Image loaded successfully. Note that this callback will
                                 * be called in the idle period between render traversals (ie. scheduled by a
                                 * setInterval), so we're not actually visiting this node at this point. We'll
                                 * defer creation and application of the texture to the subsequent visit.
                                 */
                                l.image = _image;
                                l.state = _this._STATE_IMAGE_LOADED;
                            },

                        /* General error, probably a 404
                         */
                            function() {
                                l.state = _this._STATE_ERROR;
                                var message = "SceneJS.texture image load failed: " + l.creationParams.uri;
                                SceneJS_loggingModule.getLogger().warn(message);

                                /* Currently recovering from failed texture load
                                 */

                                // SceneJS_errorModule.error(
                                //       new SceneJS.exceptions.ImageLoadFailedException(message));
                            },

                        /* Load aborted - eg. user stopped browser
                         */
                            function() {
                                SceneJS_loggingModule.getLogger().warn("SceneJS.texture image load aborted: " + l.creationParams.uri);
                                l.state = _this._STATE_ERROR;
                            });
                }).call(this, layer);
                break;

            case this._STATE_IMAGE_LOADING:

                /* Continue loading this texture layer
                 */
                break;

            case this._STATE_IMAGE_LOADED:

                /* Create this texture layer
                 */
                layer.texture = SceneJS_textureModule.createTexture(layer.image, layer.creationParams);
                layer.state = this._STATE_TEXTURE_CREATED;
                countLayersReady++;
                break;

            case this._STATE_ERROR:

                /* Give up on this texture layer, but we'll keep updating the others
                 * to at least allow diagnostics to log
                 */
                break;
        }
    }

    if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if ((countLayersReady == this._layers.length)) { // All or none - saves on generating/destroying shaders
            var countPushed = 0;
            for (var i = 0; i < this._layers.length; i++) {
                var layer = this._layers[i];
              //   if (layer.state == this._STATE_TEXTURE_CREATED) {
                SceneJS_textureModule.pushLayer(layer.texture, {
                    applyFrom : layer.applyFrom,
                    applyTo : layer.applyTo,
                    blendMode : layer.blendMode,
                    matrix: layer.createMatrix(data)
                });
                countPushed++;
                }
           // }
            this._renderNodes(traversalContext, data);
            SceneJS_textureModule.popLayers(countPushed);
        }
    }
};


/** Function wrapper to support functional scene definition
 */
SceneJS.texture = function() {
    var n = new SceneJS.Texture();
    SceneJS.Texture.prototype.constructor.apply(n, arguments);
    return n;
};
