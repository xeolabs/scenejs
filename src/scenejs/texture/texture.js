/**
 * @class A scene node that defines one or more layers of texture to apply to all those geometries within its subgraph
 * that have UV coordinates.
 */
new (function() {

    var canvas;
    var idStack = [];
    var textureStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.INIT,
            function() {

            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {
                canvas = params.canvas;
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setTexture(idStack[stackLen - 1], textureStack[stackLen - 1]);
                    } else  {
                        SceneJS_renderModule.setTexture();
                    }
                    dirty = false;
                }
            });

    /** Creates texture from either image URL or image object
     */
    function createTexture(cfg, onComplete) {
        var context = canvas.context;
        var textureId = SceneJS._createUUID();
        try {
            if (cfg.autoUpdate) {
                var update = function() {
                    //TODO: fix this when minefield is upto spec
                    try {
                        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
                    }
                    catch(e) {

                        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image, null);
                    }
                    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
                    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
                    //  context.generateMipmap(context.TEXTURE_2D);
                };
            }
            return new SceneJS_webgl_Texture2D(context, {
                textureId : textureId,
                canvas: canvas,
                image : cfg.image,
                url: cfg.uri,
                texels :cfg.texels,
                minFilter : getGLOption("minFilter", context, cfg, context.LINEAR),
                magFilter :  getGLOption("magFilter", context, cfg, context.LINEAR),
                wrapS : getGLOption("wrapS", context, cfg, context.CLAMP_TO_EDGE),
                wrapT :   getGLOption("wrapT", context, cfg, context.CLAMP_TO_EDGE),
                isDepth :  getOption(cfg.isDepth, false),
                depthMode : getGLOption("depthMode", context, cfg, context.LUMINANCE),
                depthCompareMode : getGLOption("depthCompareMode", context, cfg, context.COMPARE_R_TO_TEXTURE),
                depthCompareFunc : getGLOption("depthCompareFunc", context, cfg, context.LEQUAL),
                flipY : getOption(cfg.flipY, true),
                width: getOption(cfg.width, 1),
                height: getOption(cfg.height, 1),
                internalFormat : getGLOption("internalFormat", context, cfg, context.LEQUAL),
                sourceFormat : getGLOption("sourceType", context, cfg, context.ALPHA),
                sourceType : getGLOption("sourceType", context, cfg, context.UNSIGNED_BYTE),
                logging: SceneJS_loggingModule ,
                update: update
            }, onComplete);
        } catch (e) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.ERROR, "Failed to create texture: " + e.message || e);
        }
    }

    function getGLOption(name, context, cfg, defaultVal) {
        var value = cfg[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS_webgl_enumMap[value];
        if (glName == undefined) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        var glValue = context[glName];
        //                if (!glValue) {
        //                    throw new SceneJS.errors.WebGLUnsupportedNodeConfigException(
        //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
        //                }
        return glValue;
    }

    function getOption(value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    }

    function destroyTexture(texture) {
        texture.destroy();
    }

    function pushTexture(id, layers) {
        idStack[stackLen] = id;
        textureStack[stackLen] = layers;
        stackLen++;
        dirty = true;
    }

    function popTexture() {
        stackLen--;
        dirty = true;
    }

    var Texture = SceneJS.createNodeType("texture");

    Texture.prototype._init = function(params) {
        this._layers = [];
        this._params = {};

        /* When set, texture waits for layers to load before compiling children
         */
        var config = SceneJS_debugModule.getConfigs("texturing") || {};
        this._params.waitForLoad = (config.waitForLoad != undefined && config.waitForLoad != null)
                ? config.waitForLoad
                : params.waitForLoad;

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
                        "Texture.layers[" + i + "] has no uri, imageBuf or canvasId specified");
            }
            if (layerParam.applyFrom) {
                if (layerParam.applyFrom != "uv" &&
                    layerParam.applyFrom != "uv2" &&
                    layerParam.applyFrom != "normal" &&
                    layerParam.applyFrom != "geometry") {
                    throw SceneJS_errorModule.fatalError(
                            SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "Texture.layers[" + i + "].applyFrom value is unsupported - " +
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
                            "Texture.layers[" + i + "].applyTo value is unsupported - " +
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
    Texture.prototype.getState = function() {
        return this._state;
    };

    Texture.prototype._compile = function(traversalContext) {
        var layer;
        for (var i = 0; i < this._layers.length; i++) {
            layer = this._layers[i];
            if (!layer.texture) {
                if (layer.creationParams.imageBuf) {
                    layer.texture = SceneJS._compilationStates.getState("imagebuf", layer.creationParams.imageBuf);
                } else {
                    var self = this;
                    layer.texture = createTexture(
                            layer.creationParams,
                            function() {
                                SceneJS_compileModule.nodeUpdated(self, "loaded"); // Trigger display list redraw                             
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
        pushTexture(this.attr.id, { layers: this._layers, params: this._params });
        this._compileNodes(traversalContext);
        popTexture();
    };

    Texture.prototype._rebuildTextureMatrix = function(layer) {
        if (layer.rebuildMatrix) {
            if (layer.translate || layer.rotate || layer.scale) {
                layer.matrix = Texture.prototype._getMatrix(layer.translate, layer.rotate, layer.scale);
                layer.matrixAsArray = new Float32Array(layer.matrix);
                layer.rebuildMatrix = false;
            }
        }
    };

    Texture.prototype._getMatrix = function(translate, rotate, scale) {
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

    Texture.prototype.setLayer = function(cfg) {
        if (cfg.index == undefined || cfg.index == null) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Invalid Texture#setLayerConfig argument: index null or undefined");
        }
        if (cfg.index < 0 || cfg.index >= this._layers.length) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Invalid Texture#setLayer argument: index out of range (" + this._layers.length + " layers defined)");
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
    };

    Texture.prototype.setLayers = function(layers) {
        for (var index in layers) {
            if (layers.hasOwnProperty(index)) {
                if (index != undefined || index != null) {

                    if (index < 0 || index >= this._layers.length) {
                        throw SceneJS_errorModule.fatalError(
                                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                                "Invalid Texture#setLayer argument: index out of range (" + this._layers.length + " layers defined)");
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
    };

    Texture.prototype.setTranslate = function(layer, xy) {
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

    Texture.prototype.setScale = function(layer, xy) {
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

    Texture.prototype.setRotate = function(layer, angle) {
        if (!layer.rotate) {
            layer.rotate = angle;
        }
        layer.rotate = angle;
        layer.rebuildMatrix = true;
    };

    Texture.prototype._destroy = function() {
        if (this._destroyed) { // Not created yet
            return;
        }
        this._destroyed = true; // Pending layer creations will destroy again as they are created
        var layer;
        for (var i = 0, len = this._layers.length; i < len; i++) {
            layer = this._layers[i];
            if (layer.texture) {
                destroyTexture(layer.texture);
            }
        }
    };

})();