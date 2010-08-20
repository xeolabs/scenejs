/**
 * @class A scene node that defines one or more layers of texture to apply to all geometries within its subgraph that have UV coordinates.
 * @extends SceneJS.node
 * <p>Texture layers are applied to specified material reflection cooficients, and may be transformed.</p>

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
 *                   ],
 *
 *                   // You can observe the state of the Texture node:
 *
 *                   listeners: {
 *                       "state-changed":
 *                           function(event) {
 *                               switch (event.params.newState) {
 *                                   case SceneJS.Texture.STATE_INITIAL:
 *                                       alert("SceneJS.Texture.STATE_INITIAL");
 *                                       break;
 *
 *                                   case SceneJS.Texture.STATE_LOADING:
 *
 *                                       // At least one layer still loading
 *
 *                                       alert("SceneJS.Texture.STATE_LOADING");
 *                                       break;
 *
 *                                   case SceneJS.Texture.STATE_LOADED:
 *
 *                                       // All layers loaded
 *
 *                                       alert("SceneJS.Texture.STATE_LOADED");
 *                                       break;
 *
 *                                   case SceneJS.Texture.STATE_ERROR:
 *
 *                                       // One or more layers failed to load - Layer
 *                                       // will limp on, remaining in this state
 *
 *                                       alert("SceneJS.Texture.STATE_ERROR: " + params.exception.message || params.exception);
 *                                       break;
 *                                  }
 *                              }
 *                          }
 *                     }
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
    this._state = SceneJS.Texture.STATE_INITIAL;
};

SceneJS._inherit(SceneJS.Texture, SceneJS.Node);

/** Ready to create texture layers
 */
SceneJS.Texture.STATE_INITIAL = 0;

/** At least one texture layer image load in progress. The Texture node can temporarily revert to this
 * after {@link STATE_LOADED} if any layer has been evicted from VRAM (after lack of use) while
 * the Texture node re-creates it.
 */
SceneJS.Texture.STATE_LOADING = 1;

/** All texture layer image loads completed
 */
SceneJS.Texture.STATE_LOADED = 2;

/** At least one texture layer creation or image load failed. The Texture node limps on in this state.
 */
SceneJS.Texture.STATE_ERROR = -1;

// @private
SceneJS.Texture.prototype._getMatrix = function(translate, rotate, scale) {
    var matrix = null;
    var t;
    if (translate) {
        matrix = SceneJS._math_translationMat4v([ translate.x || 0, translate.y || 0, translate.z || 0]);
    }
    if (scale) {
        t = SceneJS._math_scalingMat4v([ scale.x || 1, scale.y || 1, scale.z || 1]);
        matrix = matrix ? SceneJS._math_mulMat4(matrix, t) : t;
    }
    if (rotate) {
        if (rotate.x) {
            t = SceneJS._math_rotationMat4v(rotate.x * 0.0174532925, [1,0,0]);
            matrix = matrix ? SceneJS._math_mulMat4(matrix, t) : t;
        }
        if (rotate.y) {
            t = SceneJS._math_rotationMat4v(rotate.y * 0.0174532925, [0,1,0]);
            matrix = matrix ? SceneJS._math_mulMat4(matrix, t) : t;
        }
        if (rotate.z) {
            t = SceneJS._math_rotationMat4v(rotate.z * 0.0174532925, [0,0,1]);
            matrix = matrix ? SceneJS._math_mulMat4(matrix, t) : t;
        }
    }
    return matrix;
};

// @private
SceneJS.Texture.prototype._init = function(params) {
    this._layers = [];
    if (!params.layers) {
        throw new SceneJS.errors.NodeConfigExpectedException(
                "SceneJS.Texture.layers is undefined");
    }
    for (var i = 0; i < params.layers.length; i++) {
        var layerParam = params.layers[i];
        if (!layerParam.uri) {
            throw new SceneJS.errors.NodeConfigExpectedException(
                    "SceneJS.Texture.layers[" + i + "].uri is undefined");
        }
        if (layerParam.applyFrom) {
            if (layerParam.applyFrom != "uv" &&
                layerParam.applyFrom != "uv2" &&
                layerParam.applyFrom != "normal" &&
                layerParam.applyFrom != "geometry") {
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.InvalidNodeConfigException(
                                "SceneJS.Texture.layers[" + i + "].applyFrom value is unsupported - " +
                                "should be either 'uv', 'uv2', 'normal' or 'geometry'"));
            }
        }
        if (layerParam.applyTo) {
            if (layerParam.applyTo != "baseColor" && // Colour map
                layerParam.applyTo != "diffuseColor") {
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.InvalidNodeConfigException(
                                "SceneJS.Texture.layers[" + i + "].applyTo value is unsupported - " +
                                "should be either 'baseColor', 'diffuseColor'"));
            }
        }
        this._layers.push({
            state : SceneJS.TextureLayer.STATE_INITIAL,
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
};

SceneJS.Texture.prototype._render = function(traversalContext, data) {
    if (!this._layers) { // One-shot dynamic config
        this._init(this._getParams(data));
    }

    /*-----------------------------------------------------
     * On each render, update state of each texture layer
     * and count how many are ready to apply
     *-----------------------------------------------------*/

    var countLayersReady = 0;
    for (var i = 0; i < this._layers.length; i++) {
        var layer = this._layers[i];

        if (layer.state == SceneJS.TextureLayer.STATE_LOADED) {
            if (!SceneJS._textureModule.textureExists(layer.texture)) {  // Texture evicted from cache
                layer.state = SceneJS.TextureLayer.STATE_INITIAL;
            }
        }


        switch (layer.state) {

            case SceneJS.TextureLayer.STATE_LOADED: // Layer ready to apply
                countLayersReady++;
                break;

            case SceneJS.TextureLayer.STATE_INITIAL: // Layer load to start
                layer.state = SceneJS.TextureLayer.STATE_LOADING;
                var self = this;
                (function(l) { // Closure allows this layer to receive results
                    SceneJS._textureModule.createTexture(
                            l.creationParams.uri,
                            l.creationParams,

                            function(texture) { // Success
                                l.texture = texture;
                                l.state = SceneJS.TextureLayer.STATE_LOADED;
                            },

                            function() { // General error, probably 404
                                l.state = SceneJS.TextureLayer.STATE_ERROR;
                                var message = "SceneJS.texture image load failed: " + l.creationParams.uri;
                                SceneJS._loggingModule.warn(message);

                                if (self._state != SceneJS.Texture.STATE_ERROR) { // Don't keep re-entering STATE_ERROR
                                    self._changeState(SceneJS.Texture.STATE_ERROR, {
                                        exception: new SceneJS.errors.Exception("SceneJS.Exception - " + message)
                                    });
                                }
                            },

                            function() { // Load aborted - user probably refreshed/stopped page
                                SceneJS._loggingModule.warn("SceneJS.texture image load aborted: " + l.creationParams.uri);
                                l.state = SceneJS.TextureLayer.STATE_ERROR;

                                if (self._state != SceneJS.Texture.STATE_ERROR) { // Don't keep re-entering STATE_ERROR
                                    self._changeState(SceneJS.Texture.STATE_ERROR, {
                                        exception: new SceneJS.errors.Exception("SceneJS.Exception - texture image load stopped - user aborted it?")
                                    });
                                }
                            });
                }).call(this, layer);
                break;

            case SceneJS.TextureLayer.STATE_LOADING: // Layer still loading
                break;

            case SceneJS.TextureLayer.STATE_ERROR: // Layer disabled
                break;
        }
    }

    /*------------------------------------------------
     * Render this node
     *-----------------------------------------------*/

    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {

        /* Fastest strategy is to allow the complete set of layers to load
         * before applying any of them. There would be a huge performance penalty
         * if we were to apply the incomplete set as layers are still loading -
         * SceneJS._shaderModule would then have to generate a new shader for each new
         * layer loaded, which would become redundant as soon as the next layer is loaded.
         */

        if (countLayersReady == this._layers.length) {
            var countPushed = 0;
            for (var i = 0; i < this._layers.length; i++) {
                var layer = this._layers[i];

                if (layer.state = SceneJS.TextureLayer.STATE_LOADED) {
                    SceneJS._textureModule.pushLayer(layer.texture, {
                        applyFrom : layer.applyFrom,
                        applyTo : layer.applyTo,
                        blendMode : layer.blendMode,
                        matrix: layer.createMatrix(data)
                    });
                    countPushed++;
                }
            }

            if (this._state != SceneJS.Texture.STATE_ERROR && // Not stuck in STATE_ERROR
                this._state != SceneJS.Texture.STATE_LOADED) {    // Waiting for layers to load
                this._changeState(SceneJS.Texture.STATE_LOADED);  // All layers now loaded
            }

            this._renderNodes(traversalContext, data);
            SceneJS._textureModule.popLayers(countPushed);
        } else {

            if (this._state != SceneJS.Texture.STATE_ERROR && // Not stuck in STATE_ERROR
                this._state != SceneJS.Texture.STATE_LOADING) {   // Waiting in STATE_INITIAL
                this._changeState(SceneJS.Texture.STATE_LOADING); // Now loading some layers
            }
            this._renderNodes(traversalContext, data);
        }
    }
};


// @private
SceneJS.Texture.prototype._changeState = function(newState, params) {
    params = params || {};
    params.oldState = this._state;
    params.newState = newState;
    this._state = newState;
    if (this._listeners["state-changed"]) {
        this._fireEvent("state-changed", params);
    }
};


/** Factory function that returns a new {@link SceneJS.Texture} instance
 */
SceneJS.texture = function() {
    var n = new SceneJS.Texture();
    SceneJS.Texture.prototype.constructor.apply(n, arguments);
    return n;
};

SceneJS.registerNodeType("texture", SceneJS.texture);
