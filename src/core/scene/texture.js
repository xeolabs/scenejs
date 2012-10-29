/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function() {

    /**
     * The default state core singleton for {@link SceneJS.Texture} nodes
     */
    var defaultCore = {
        type: "texture",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.texture = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which defines one or more textures to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Texture = SceneJS_NodeFactory.createNodeType("texture");

    SceneJS.Texture.prototype._init = function(params) {

        if (this._core.useCount == 1) { // This node is the resource definer

            this._core.layers = [];
            this._core.params = {};

            var waitForLoad = !!params.waitForLoad;

            if (!params.layers) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture layers missing");
            }

            if (!SceneJS._isArray(params.layers)) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture layers should be an array");
            }

            var layerParams;
            var gl = this._engine.canvas.gl;

            for (var i = 0; i < params.layers.length; i++) {

                layerParams = params.layers[i];

                if (!layerParams.asset && !layerParams.uri && !layerParams.src && !layerParams.frameBuf && !layerParams.video) {

                    throw SceneJS_error.fatalError(
                            SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture layer " + i + "  has no uri, src, asset, frameBuf, video or canvasId specified");
                }

                if (layerParams.applyFrom) {

                    if (layerParams.applyFrom != "uv" &&
                        layerParams.applyFrom != "uv2" &&
                        layerParams.applyFrom != "normal" &&
                        layerParams.applyFrom != "geometry") {

                        throw SceneJS_error.fatalError(
                                SceneJS.errors.NODE_CONFIG_EXPECTED,
                                "texture layer " + i + "  applyFrom value is unsupported - " +
                                "should be either 'uv', 'uv2', 'normal' or 'geometry'");
                    }
                }

                if (layerParams.applyTo) {

                    if (layerParams.applyTo != "baseColor" && // Colour map
                        layerParams.applyTo != "specular" && // Specular map
                        layerParams.applyTo != "emit" && // Emission map
                        layerParams.applyTo != "alpha" && // Alpha map
                        layerParams.applyTo != "normals") {

                        throw SceneJS_error.fatalError(
                                SceneJS.errors.NODE_CONFIG_EXPECTED,
                                "texture layer " + i + " applyTo value is unsupported - " +
                                "should be either 'baseColor', 'specular' or 'normals'");
                    }
                }

                if (layerParams.blendMode) {

                    if (layerParams.blendMode != "add" && layerParams.blendMode != "multiply") {

                        throw SceneJS_error.fatalError(
                                SceneJS.errors.NODE_CONFIG_EXPECTED,
                                "texture layer " + i + " blendMode value is unsupported - " +
                                "should be either 'add' or 'multiply'");
                    }
                }

                var layer = SceneJS._apply(layerParams, {
                    waitForLoad: waitForLoad,
                    texture: null,
                    applyFrom: layerParams.applyFrom || "uv",
                    applyTo: layerParams.applyTo || "baseColor",
                    blendMode: layerParams.blendMode || "add",
                    blendFactor: (layerParams.blendFactor != undefined && layerParams.blendFactor != null) ? layerParams.blendFactor : 1.0,
                    translate: { x:0, y: 0},
                    scale: { x: 1, y: 1 },
                    rotate: { z: 0.0 }
                });

                this._core.layers.push(layer);

                this._setLayerTransform(layerParams, layer);

                if (layer.frameBuf) { // Create from a frameBuf node preceeding this texture in the scene graph

                    var targetNode = this._engine.findNode(layer.frameBuf);

                    if (targetNode && targetNode.type == "frameBuf") {
                        layer.texture = targetNode._core.frameBuf.getTexture(); // TODO: what happens when the frameBuf is destroyed?
                    }

                } else { // Create from texture node's layer configs
                    this._loadLayerTexture(gl, layer);
                }
            }

            var self = this;

            /**
             * WebGL restored handler - rebuilds the texture layers
             */
            this._core.webglRestored = function() {

                var layers = self._core.layers;
                var gl = self._engine.canvas.gl;

                for (var i = 0, len = layers.length; i < len; i++) {
                    self._loadLayerTexture(gl, layers[i]);
                }
            };
        }
    };

    SceneJS.Texture.prototype._loadLayerTexture = function(gl, layer) {

        SceneJS_sceneStatusModule.nodeLoading(this);

        this._engine.nodeLoading(this);

        this._fireEvent("loading");

        var self = this;

        var assetConfigs = layer.asset;

        if (assetConfigs) {

            /* Load from asset
             */
            var assetService = SceneJS.Plugins.getPlugin(SceneJS.Plugins.TEXTURE_ASSET_PLUGIN, assetConfigs.type);

            if (!assetService) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.PLUGIN_INVALID,
                        "texture: no plugin installed for texture asset type '" + assetConfigs.type + "'.");
            }

            if (!assetService.getAsset) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.PLUGIN_INVALID,
                        "texture: 'getAsset' method missing on plugin for texture asset type '" + assetConfigs.type + "'.");
            }

            var asset = assetService.getAsset({ gl: gl });

            if (!asset.onUpdate) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.PLUGIN_INVALID,
                        "texture: 'onUpdate' method missing on plugin for texture asset type '" + assetConfigs.type + "'");
            }

            asset.onUpdate(// Get notification whenever asset updates the texture
                    (function() {
                        var loaded = false;
                        return function() {
                            if (!loaded) { // Texture first initialised - create layer
                                loaded = true;
                                self._setLayerTexture(gl, layer, asset.getTexture());

                            } else { // Texture updated - layer already has the handle to it, so just signal a redraw
                                self._engine.display.imageDirty = true;
                            }
                        };
                    })());

         //   this._setLayerTexture(gl, layer, asset.getTexture());

            asset.setConfigs(assetConfigs); // Configure the asset, which may cause it to update the texture

            layer._asset = asset;

        } else {

            /* Load from URL
             */
            var image = new Image();

            image.onload = function() {
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._ensureImageSizePowerOfTwo(image));
                self._setLayerTexture(gl, layer, texture);
            };

            image.crossOrigin = "";
            image.src = layer.uri || layer.src;
        }
    };

    SceneJS.Texture.prototype._ensureImageSizePowerOfTwo = function(image) {

        if (!this._isPowerOfTwo(image.width) || !this._isPowerOfTwo(image.height)) {

            var canvas = document.createElement("canvas");
            canvas.width = this._nextHighestPowerOfTwo(image.width);
            canvas.height = this._nextHighestPowerOfTwo(image.height);

            var ctx = canvas.getContext("2d");

            ctx.drawImage(image,
                    0, 0, image.width, image.height,
                    0, 0, canvas.width, canvas.height);

            image = canvas;
            image.crossOrigin = "";
        }
        return image;
    };

    SceneJS.Texture.prototype._isPowerOfTwo = function(x) {
        return (x & (x - 1)) == 0;
    };

    SceneJS.Texture.prototype._nextHighestPowerOfTwo = function(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    };

    SceneJS.Texture.prototype._setLayerTexture = function(gl, layer, texture) {

        layer.texture = new SceneJS_webgl_Texture2D(gl, {
            texture: texture, // WebGL texture object
            minFilter : this._getGLOption("minFilter", gl, layer, gl.LINEAR_MIPMAP_NEAREST),
            magFilter :  this._getGLOption("magFilter", gl, layer, gl.LINEAR),
            wrapS : this._getGLOption("wrapS", gl, layer, gl.CLAMP_TO_EDGE),
            wrapT :   this._getGLOption("wrapT", gl, layer, gl.CLAMP_TO_EDGE),
            isDepth :  this._getOption(layer.isDepth, false),
            depthMode : this._getGLOption("depthMode", gl, layer, gl.LUMINANCE),
            depthCompareMode : this._getGLOption("depthCompareMode", gl, layer, gl.COMPARE_R_TO_TEXTURE),
            depthCompareFunc : this._getGLOption("depthCompareFunc", gl, layer, gl.LEQUAL),
            flipY : this._getOption(layer.flipY, true),
            width: this._getOption(layer.width, 1),
            height: this._getOption(layer.height, 1),
            internalFormat : this._getGLOption("internalFormat", gl, layer, gl.LEQUAL),
            sourceFormat : this._getGLOption("sourceType", gl, layer, gl.ALPHA),
            sourceType : this._getGLOption("sourceType", gl, layer, gl.UNSIGNED_BYTE),
            update: null
        });

        SceneJS_sceneStatusModule.nodeLoaded(this);

        this._engine.nodeLoaded(this);

        this._fireEvent("loaded");

        if (this.destroyed) { // Node was destroyed while loading
            layer.texture.destroy();
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.Texture.prototype._getGLOption = function(name, gl, layer, defaultVal) {
        var value = layer[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS_webgl_enumMap[value];
        if (glName == undefined) {
            throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        var glValue = gl[glName];
        //                if (!glValue) {
        //                    throw new SceneJS.errors.WebGLUnsupportedNodeConfigException(
        //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
        //                }
        return glValue;
    };

    SceneJS.Texture.prototype._getOption = function(value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    /**
     * Set some writeable properties on a layer
     */
    SceneJS.Texture.prototype.setLayer = function(cfg) {

        if (cfg.index == undefined || cfg.index == null) {
            throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Invalid texture set layer argument: index null or undefined");
        }

        if (cfg.index < 0 || cfg.index >= this._core.layers.length) {
            throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Invalid texture set layer argument: index out of range (" + this._core.layers.length + " layers defined)");
        }

        this._setLayer(parseInt(cfg.index), cfg);

        this._engine.display.imageDirty = true;
    };

    /**
     * Set some writeable properties on multiple layers
     */
    SceneJS.Texture.prototype.setLayers = function(layers) {
        var indexNum;
        for (var index in layers) {
            if (layers.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this._core.layers.length) {
                        throw SceneJS_error.fatalError(
                                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                                "Invalid texture set layer argument: index out of range (" + this._core.layers.length + " layers defined)");
                    }
                    this._setLayer(indexNum, layers[index] || {});
                }
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Texture.prototype._setLayer = function(index, cfg) {

        cfg = cfg || {};

        var layer = this._core.layers[index];

        if (cfg.blendFactor != undefined && cfg.blendFactor != null) {
            layer.blendFactor = cfg.blendFactor;
        }

        if (cfg.asset) {
            var asset = layer._asset;
            if (asset) {
                asset.setConfigs(cfg.asset);
            }
        }

        if (cfg.translate || cfg.rotate || cfg.scale) {
            this._setLayerTransform(cfg, layer);
        }
    };

    SceneJS.Texture.prototype._setLayerTransform = function(cfg, layer) {
        
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

    SceneJS.Texture.prototype._compile = function() {

        if (!this._core.hash) {
            this._makeHash();
        }

        this._engine.display.texture = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.texture = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Texture.prototype._makeHash = function() {

        var core = this._core;
        var hash;

        if (core.layers && core.layers.length > 0) {

            var layers = core.layers;
            var hashParts = [];
            var texLayer;

            for (var i = 0, len = layers.length; i < len; i++) {

                texLayer = layers[i];

                hashParts.push("/");
                hashParts.push(texLayer.applyFrom);
                hashParts.push("/");
                hashParts.push(texLayer.applyTo);
                hashParts.push("/");
                hashParts.push(texLayer.blendMode);

                if (texLayer.matrix) {
                    hashParts.push("/anim");
                }
            }

            hash = hashParts.join("");

        } else {
            hash = "";
        }

        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.Texture.prototype._destroy = function() {
        if (this._core.useCount == 1) { // Last resource user
            var layers = this._core.layers;
            var layer;
            var asset;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                if (layer.texture) {
                    layer.texture.destroy();
                }
                asset = layer._asset;
                if (asset && asset.destroy) {
                    asset.destroy();
                }
            }
        }
    };

})();