/**
 * A scene node that defines one or more layers of texture to apply to geometries within its subgraph
 * that have UV coordinates.
 */
var SceneJS_textureModule = new (function() {

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
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setTexture(idStack[stackLen - 1], textureStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setTexture();
                    }
                    dirty = false;
                }
            });

    /** Creates texture from either image URL or image object
     */
    function createTexture(scene, cfg, onComplete) {
        var context = scene.canvas.context;
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
                    //context.generateMipmap(context.TEXTURE_2D);
                };
            }
            return new SceneJS_webgl_Texture2D(context, {
                textureId : textureId,
                canvas: scene.canvas,
                image : cfg.image,
                url: cfg.uri,
                texels :cfg.texels,
                minFilter : getGLOption("minFilter", context, cfg, context.NEAREST_MIPMAP_NEAREST),
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


    /*----------------------------------------------------------------------------------------------------------------
     * Texture node
     *---------------------------------------------------------------------------------------------------------------*/

    var Texture = SceneJS.createNodeType("texture");

    Texture.prototype._init = function(params) {

        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.core.layers = [];
            this.core.params = {};
            var config = SceneJS_debugModule.getConfigs("texturing") || {};
            var waitForLoad = (config.waitForLoad != undefined && config.waitForLoad != null)
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
                if (!layerParam.uri && !layerParam.imageBuf && !layerParam.video && !layerParam.image && !layerParam.canvasId) {
                    throw SceneJS_errorModule.fatalError(
                            SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture layer " + i + "  has no uri, imageBuf, video or canvasId specified");
                }
                if (layerParam.applyFrom) {
                    if (layerParam.applyFrom != "uv" &&
                        layerParam.applyFrom != "uv2" &&
                        layerParam.applyFrom != "normal" &&
                        layerParam.applyFrom != "geometry") {
                        throw SceneJS_errorModule.fatalError(
                                SceneJS.errors.NODE_CONFIG_EXPECTED,
                                "texture layer " + i + "  applyFrom value is unsupported - " +
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
                                "texture layer " + i + " applyTo value is unsupported - " +
                                "should be either 'baseColor', 'specular' or 'normals'");
                    }
                }
                if (layerParam.blendMode) {
                    if (layerParam.blendMode != "add" && layerParam.blendMode != "multiply") {
                        throw SceneJS_errorModule.fatalError(
                                SceneJS.errors.NODE_CONFIG_EXPECTED,
                                "texture layer " + i + " blendMode value is unsupported - " +
                                "should be either 'add' or 'multiply'");
                    }
                }
                var layer = {
                    image : null,                       // Initialised when state == IMAGE_LOADED
                    creationParams: layerParam,         // Create texture using this
                    waitForLoad: waitForLoad,
                    texture: null,                      // Initialised when state == TEXTURE_LOADED
                    applyFrom: layerParam.applyFrom || "uv",
                    applyTo: layerParam.applyTo || "baseColor",
                    blendMode: layerParam.blendMode || "add",
                    blendFactor: (layerParam.blendFactor != undefined && layerParam.blendFactor != null) ? layerParam.blendFactor : 1.0,
                    translate: { x:0, y: 0},
                    scale: { x: 1, y: 1 },
                    rotate: { z: 0.0 }
                };

                this.core.layers.push(layer);

                this._setLayerTransform(layerParam, layer);

                if (layer.creationParams.imageBuf) {
                    layer.texture = SceneJS._compilationStates.getState("imageBuf", this.scene.attr.id, layer.creationParams.imageBuf);

                } else if (layer.creationParams.video) {
                    layer.texture = SceneJS._compilationStates.getState("video", this.scene.attr.id, layer.creationParams.video);

                } else {
                    var self = this;
                    layer.texture = createTexture(
                            this.scene,
                            layer.creationParams,
                            function() {
                                if (self._destroyed) {
                                    destroyTexture(layer.texture);
                                }
                                SceneJS_compileModule.nodeUpdated(self, "loaded"); // Trigger display list redraw
                            });
                }
            }
        }
    };

    Texture.prototype.setLayer = function(cfg) {
        if (cfg.index == undefined || cfg.index == null) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Invalid texture set layer argument: index null or undefined");
        }
        if (cfg.index < 0 || cfg.index >= this.core.layers.length) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Invalid texture set layer argument: index out of range (" + this.core.layers.length + " layers defined)");
        }
        this._setLayer(parseInt(cfg.index), cfg);
    };

    Texture.prototype.setLayers = function(layers) {
        var indexNum;
        for (var index in layers) {
            if (layers.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this.core.layers.length) {
                        throw SceneJS_errorModule.fatalError(
                                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                                "Invalid texture set layer argument: index out of range (" + this.core.layers.length + " layers defined)");
                    }
                    this._setLayer(indexNum, layers[index] || {});
                }
            }
        }
    };

    Texture.prototype._setLayer = function(index, cfg) {
        cfg = cfg || {};
        var layer = this.core.layers[index];
        if (cfg.blendFactor != undefined && cfg.blendFactor != null) {
            layer.blendFactor = cfg.blendFactor;
        }
        this._setLayerTransform(cfg, layer);
    };

    Texture.prototype._setLayerTransform = function(cfg, layer) {
        var matrix;
        var t;
        if (cfg.translate) {
            var translate = cfg.translate;
            if (translate.x != undefined) {
                layer.translate.x = translate.x;
            }
            if (translate.y != undefined) {
                layer.translate.y = translate.y;
            }
            matrix = SceneJS_math_translationMat4v([ translate.x || 0, translate.y || 0, 0]);
        }
        if (cfg.scale) {
            var scale = cfg.scale;
            if (scale.x != undefined) {
                layer.scale.x = scale.x;
            }
            if (scale.y != undefined) {
                layer.scale.y = scale.y;
            }
            t = SceneJS_math_scalingMat4v([ scale.x || 1, scale.y || 1, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (cfg.rotate) {
            var rotate = cfg.rotate;
            if (rotate.z != undefined) {
                layer.rotate.z = rotate.z || 0;
            }
            t = SceneJS_math_rotationMat4v(rotate.z * 0.0174532925, [0,0,1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (matrix) {
            layer.matrix = matrix;
            if (!layer.matrixAsArray) {
                layer.matrixAsArray = new Float32Array(layer.matrix);
            } else {
                layer.matrixAsArray.set(layer.matrix);
            }

            layer.matrixAsArray = new Float32Array(layer.matrix); // TODO - reinsert into array
        }
    };

    Texture.prototype._compile = function() {
        idStack[stackLen] = this.core._coreId; // Tie draw list state to core, not to scene node
        textureStack[stackLen] = this.core;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };


    Texture.prototype._destroy = function() {
        if (this.core._nodeCount == 1) { // Last resource user
            var layer;
            for (var i = 0, len = this.core.layers.length; i < len; i++) {
                layer = this.core.layers[i];
                if (layer.texture) {
                    destroyTexture(layer.texture);
                }
            }
        }
    };
})();