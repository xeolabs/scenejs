/**
 * @class A scene node that defines one or more layers of texture to apply to all those geometries within its subgraph
 * that have UV coordinates.
 */
SceneJS.Texture = SceneJS.createNodeType("texture");

SceneJS.Texture.prototype._init = function(params) {
    this._layers = [];

    /* When set, texture waits for layers to load before compiling children - default is true
     */
    this._waitForLoad = (params.waitForLoad === false) ? params.waitForLoad : true;

    if (!params.layers) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_CONFIG_EXPECTED,
                "texture layers missing");
    }

    if (!SceneJS._isArray(params.layers)) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_CONFIG_EXPECTED,
                "texture layers should be an array");
    }

    for (var i = 0; i < params.layers.length; i++) {
        var layerParam = params.layers[i];
        if (!layerParam.uri && !layerParam.imageBuf && !layerParam.image && !layerParam.canvasId) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "SceneJS.Texture.layers[" + i + "] has no uri, imageBuf or canvasId specified");
        }
        if (layerParam.applyFrom) {
            if (layerParam.applyFrom != "uv" &&
                layerParam.applyFrom != "uv2" &&
                layerParam.applyFrom != "normal" &&
                layerParam.applyFrom != "geometry") {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "SceneJS.Texture.layers[" + i + "].applyFrom value is unsupported - " +
                        "should be either 'uv', 'uv2', 'normal' or 'geometry'");
            }
        }
        if (layerParam.applyTo) {
            if (layerParam.applyTo != "baseColor" && // Colour map
                layerParam.applyTo != "specular" && // Specular map
                layerParam.applyTo != "emit" && // Emission map
                layerParam.applyTo != "alpha" && // Alpha map
                //   layerParam.applyTo != "diffuseColor" &&
                layerParam.applyTo != "normals") {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "SceneJS.Texture.layers[" + i + "].applyTo value is unsupported - " +
                        "should be either 'baseColor', 'specular' or 'normals'");
            }
        }
        this._layers.push({
            image : null,                       // Initialised when state == IMAGE_LOADED
            creationParams: layerParam,         // Create texture using this
            texture: null,                      // Initialised when state == TEXTURE_LOADED
            applyFrom: layerParam.applyFrom || "uv",
            applyTo: layerParam.applyTo || "baseColor",
            blendMode: layerParam.blendMode || "add",
            scale : layerParam.scale,
            translate : layerParam.translate,
            rotate : layerParam.rotate,
            rebuildMatrix : true
        });
    }
};


/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL},
 * {@link #STATE_LOADING}, {@link #STATE_LOADED} and {@link #STATE_ERROR}.
 * @returns {int} The state
 */
SceneJS.Texture.prototype.getState = function() {
    return this._state;
};

SceneJS.Texture.prototype._compile = function(traversalContext) {
    var layer;
    for (var i = 0; i < this._layers.length; i++) {
        layer = this._layers[i];
        if (!layer.texture) {
            if (layer.creationParams.imageBuf) {
                var imageBuf = SceneJS_imageBufModule.getImageBuffer(layer.creationParams.imageBuf);
                if (imageBuf && imageBuf.isRendered()) {
                    var texture = SceneJS_imageBufModule.getTexture(layer.creationParams.imageBuf);
                    if (texture) {

                        // TODO: Waiting for target node is OK, but exception should be thrown when target is not an 'imageBuf'
                        // TODO: Re-acquire texture dynamically

                        layer.texture = texture;
                        layer.state = SceneJS.TextureLayer.STATE_LOADED;
                    }
                } else {
                    SceneJS_compileModule.nodeUpdated(this, "waitingForImagebuf");
                }
            } else {
                var self = this;
                layer.texture = SceneJS_textureModule.createTexture(
                        layer.creationParams,
                        function() {
                            SceneJS_compileModule.nodeUpdated(self, "loadedImage");
                        });
            }
            SceneJS_loadStatusModule.status.numNodesLoading++;
        } else {
            SceneJS_loadStatusModule.status.numNodesLoaded++;
        }
        if (layer.rebuildMatrix) {
            this._rebuildTextureMatrix(layer);
        }
    }
    SceneJS_textureModule.pushTexture(this._attr.id, this._layers);
    this._compileNodes(traversalContext);
    SceneJS_textureModule.popTexture();
};

SceneJS.Texture.prototype._rebuildTextureMatrix = function(layer) {
    if (layer.rebuildMatrix) {
        if (layer.translate || layer.rotate || layer.scale) {
            layer.matrix = SceneJS.Texture.prototype._getMatrix(layer.translate, layer.rotate, layer.scale);
            layer.matrixAsArray = new Float32Array(layer.matrix);
            layer.rebuildMatrix = false;
        }
    }
};

SceneJS.Texture.prototype._getMatrix = function(translate, rotate, scale) {
    var matrix = null;
    if (translate) {
        matrix = SceneJS_math_translationMat4v([ translate.x || 0, translate.y || 0, 0]);
    }
    if (scale) {
        var t = SceneJS_math_scalingMat4v([ scale.x || 1, scale.y || 1, 1]);
        matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
    }
    if (rotate) {
        var t = SceneJS_math_rotationMat4v(rotate * 0.0174532925, [0,0,1]);
        matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
    }
    return matrix;
};

/**
 *
 */
SceneJS.Texture.prototype.setLayer = function(cfg) {
    if (cfg.index == undefined || cfg.index == null) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Invalid SceneJS.Texture#setLayerConfig argument: index null or undefined");
    }
    if (cfg.index < 0 || cfg.index >= this._layers.length) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Invalid SceneJS.Texture#setLayer argument: index out of range (" + this._layers.length + " layers defined)");
    }
    var layer = this._layers[cfg.index];
    cfg = cfg.cfg || {};
    if (cfg.translate) {
        this.setTranslate(layer, cfg.translate);
    }
    if (cfg.scale) {
        this.setScale(layer, cfg.scale);
    }
    if (cfg.rotate) {
        this.setRotate(layer, cfg.rotate);
    }
    this._setDirty();
};

/**
 *
 */
SceneJS.Texture.prototype.setLayers = function(layers) {
    for (var index in layers) {
        if (layers.hasOwnProperty(index)) {
            if (index != undefined || index != null) {

                if (index < 0 || index >= this._layers.length) {
                    throw SceneJS_errorModule.fatalError(
                            SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "Invalid SceneJS.Texture#setLayer argument: index out of range (" + this._layers.length + " layers defined)");
                }
                var cfg = layers[index] || {};
                var layer = this._layers[index];
                if (cfg.translate) {
                    this.setTranslate(layer, cfg.translate);
                }
                if (cfg.scale) {
                    this.setScale(layer, cfg.scale);
                }
                if (cfg.rotate) {
                    this.setRotate(layer, cfg.rotate);
                }
            }
        }
    }
    this._setDirty();
};

/**
 * @private
 */
SceneJS.Texture.prototype.setTranslate = function(layer, xy) {
    if (!layer.translate) {
        layer.translate = { x: 0, y: 0 };
    }
    if (xy.x != undefined) {
        layer.translate.x = xy.x;
    }
    if (xy.y != undefined) {
        layer.translate.y = xy.y;
    }
    layer.rebuildMatrix = true;
};

/**
 * @private
 */
SceneJS.Texture.prototype.setScale = function(layer, xy) {
    if (!layer.scale) {
        layer.scale = { x: 1, y: 1 };
    }
    if (xy.x != undefined) {
        layer.scale.x = xy.x;
    }
    if (xy.y != undefined) {
        layer.scale.y = xy.y;
    }
    layer.rebuildMatrix = true;
};

/**
 * @private
 */
SceneJS.Texture.prototype.setRotate = function(layer, angle) {
    if (!layer.rotate) {
        layer.rotate = angle;
    }
    layer.rotate = angle;
    layer.rebuildMatrix = true;
};

// @private
SceneJS.Texture.prototype._destroy = function() {
    if (this._destroyed) { // Not created yet
        return;
    }
    this._destroyed = true; // Pending layer creations will destroy again as they are created
    var layer;
    for (var i = 0, len = this._layers.length; i < len; i++) {
        layer = this._layers[i];
        if (layer.texture) {
            SceneJS_textureModule.destroyTexture(layer.texture);
        }
    }
};
