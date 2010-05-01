/**
 * Backend that manages material texture layers.
 *
 * Manages asynchronous load of texture images.
 *
 * Caches textures with a least-recently-used eviction policy.
 *
 * Holds currently-applied textures as "layers". Each layer specifies a texture and a set of parameters for
 * how the texture is to be applied, ie. to modulate ambient, diffuse, specular material colors, geometry normals etc.
 *
 * Holds the layers on a stack and provides the SceneJS.texture node with methods to push and pop them.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * TEXTURES_EXPORTED to pass the entire layer stack to the shading backend.
 *
 * Avoids redundant export of the layers with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the texture node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a texture node pushes or pops the stack, this backend publishes it with a TEXTURES_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
var SceneJS_textureModule = new (function() {

    var time = (new Date()).getTime();      // Current system time for LRU caching
    var canvas;
    var textures = {};
    var layerStack = [];
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                layerStack = [];
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.TEXTURES_EXPORTED,
                            layerStack
                            );
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /** Removes texture from shader (if canvas exists in DOM) and deregisters it from backend
     * @private
     */
    function deleteTexture(texture) {
        textures[texture.textureId] = undefined;
        if (document.getElementById(texture.canvas.canvasId)) {
            texture.destroy();
        }
    }

    /**
     * Deletes all textures from their GL contexts - does not attempt
     * to delete them when their canvases no longer exist in the DOM.
     * @private
     */
    function deleteTextures() {
        for (var textureId in textures) {
            var texture = textures[textureId];
            deleteTexture(texture);
        }
        textures = {};
        layerStack = [];
        dirty = true;
    }

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET, // Framework reset - delete textures
            function() {
                deleteTextures();
            });

    /**
     * Registers this backend module with the memory management module as willing
     * to attempt to destroy a texture when asked, in order to free up memory. Eviction
     * is done on a least-recently-used basis, where a texture may be evicted if the
     * time that it was last used is the earliest among all textures, and after the current
     * system time. Since system time is updated just before scene traversal, this ensures that
     * textures previously or currently active during this traversal are not suddenly evicted.
     */
    SceneJS_memoryModule.registerEvictor(
            function() {
                var earliest = time; // Doesn't evict textures that are current in layers
                var evictee;
                for (var id in textures) {
                    if (id) {
                        var texture = textures[id];
                        if (texture.lastUsed < earliest) {
                            evictee = texture;
                            earliest = texture.lastUsed;
                        }
                    }
                }
                if (evictee) { // Delete LRU texture
                    SceneJS_loggingModule.info("Evicting texture: " + id);
                    deleteTexture(evictee);
                    return true;
                }
                return false;   // Couldnt find suitable evictee
            });

    /**
     * Translates a SceneJS param value to a WebGL enum value,
     * or to default if undefined. Throws exception when defined
     * but not mapped to an enum.
     * @private
     */
    function getGLOption(name, context, cfg, defaultVal) {
        var value = cfg[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS_webgl_enumMap[value];
        if (glName == undefined) {
            SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                    "Unrecognised value for SceneJS.texture node property '" + name + "' value: '" + value + "'"));
        }
        var glValue = context[glName];
        //                if (!glValue) {
        //                    throw new SceneJS.WebGLUnsupportedNodeConfigException(
        //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
        //                }
        return glValue;
    }

    /** Returns default value for when given value is undefined
     * @private
     */
    function getOption(value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    }


    /** Verifies that texture still cached - it may have been evicted after lack of recent use,
     * in which case client texture node will have to recreate it.
     * @private
     */
    this.textureExists = function(texture) {
        return textures[texture.textureId];
    };

    /**
     * Starts load of texture image
     *
     * @private
     * @param uri Image location
     * @param onSuccess Callback returns image on success
     * @param onError Callback fired on failure
     * @param onAbort Callback fired when load aborted, eg. user hits "stop" button in browser
     */
    this.loadImage = function(uri, onSuccess, onError, onAbort) {
        var image = new Image();
        image.onload = function() {
            onSuccess(image);
        };
        image.onerror = function() {
            onError();
        };
        image.onabort = function() {
            onAbort();
        };
        image.src = uri;  // Starts image load
        return image;
    };

    /**
     * Creates and returns a new texture, or re-uses existing one if possible
     * @private
     */
    this.createTexture = function(image, cfg) {
        if (!canvas) {
            SceneJS_errorModule.fatalError(new SceneJS.NoCanvasActiveException("No canvas active"));
        }
        var context = canvas.context;
        var textureId = SceneJS._createKeyForMap(textures, "tex");

        SceneJS_memoryModule.allocate(
                "texture '" + textureId + "'",
                function() {
                    textures[textureId] = new SceneJS_webgl_Texture2D(context, {
                        textureId : textureId,
                        canvas: canvas,
                        image : image,
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
                        logging: SceneJS_loggingModule
                    });
                });
        //   SceneJS_loggingModule.info("texture created: '" + textureId + "'");
        return textures[textureId];
    };

    // @private
    this.pushLayer = function(texture, params) {
        if (!textures[texture.textureId]) {
            SceneJS_errorModule.fatalError("No such texture loaded \"" + texture.textureId + "\"");
        }
        texture.lastUsed = time;

        if (params.matrix && !params.matrixAsArray) {
            params.matrixAsArray = new WebGLFloatArray(params.matrix);
        }
        layerStack.push({
            texture: texture,
            params: params
        });
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.TEXTURES_UPDATED, layerStack);
    };

    // @private
    this.popLayers = function(nLayers) {
        for (var i = 0; i < nLayers; i++) {
            layerStack.pop();
        }
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.TEXTURES_UPDATED, layerStack);
    };
})();