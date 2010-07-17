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
 * when the stack is pushed or popped by the texture node, or on SCENE_RENDERING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a texture node pushes or pops the stack, this backend publishes it with a TEXTURES_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
SceneJS._textureModule = new (function() {

    var time = (new Date()).getTime();      // Current system time for LRU caching
    var canvas;
    var textures = {};
    var layerStack = [];
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                layerStack = [];
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._eventModule.fireEvent(
                            SceneJS._eventModule.TEXTURES_EXPORTED,
                            layerStack
                            );
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
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

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET, // Framework reset - delete textures
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
    SceneJS._memoryModule.registerEvictor(
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
                    SceneJS._loggingModule.info("Evicting texture: " + id);
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
        var glName = SceneJS._webgl_enumMap[value];
        if (glName == undefined) {
            throw SceneJS._errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
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

    this.createTexture = function(uri, cfg, onSuccess, onError, onAbort) {
        var image = new Image();
        var _canvas = canvas;
        var _context = canvas.context;
        var process = SceneJS._processModule.createProcess({ // To support monitor of image loads through SceneJS PROCESS_XXX events
            description:"creating texture: uri = " + uri,
            timeoutSecs: -1 // Relying on Image object for timeout
        });
        //alert(uri);
        image.onload = function() {
            var textureId = SceneJS._createKeyForMap(textures, "t");
            SceneJS._memoryModule.allocate(
                    _context,
                    "texture '" + textureId + "'",
                    function() {
                        try {
                            textures[textureId] = new SceneJS._webgl_Texture2D(_context, {
                                textureId : textureId,
                                canvas: _canvas,
                                image : image,
                                texels :cfg.texels,
                                minFilter : getGLOption("minFilter", _context, cfg, _context.LINEAR),
                                magFilter :  getGLOption("magFilter", _context, cfg, _context.LINEAR),
                                wrapS : getGLOption("wrapS", _context, cfg, _context.CLAMP_TO_EDGE),
                                wrapT :   getGLOption("wrapT", _context, cfg, _context.CLAMP_TO_EDGE),
                                isDepth :  getOption(cfg.isDepth, false),
                                depthMode : getGLOption("depthMode", _context, cfg, _context.LUMINANCE),
                                depthCompareMode : getGLOption("depthCompareMode", _context, cfg, _context.COMPARE_R_TO_TEXTURE),
                                depthCompareFunc : getGLOption("depthCompareFunc", _context, cfg, _context.LEQUAL),
                                flipY : getOption(cfg.flipY, true),
                                width: getOption(cfg.width, 1),
                                height: getOption(cfg.height, 1),
                                internalFormat : getGLOption("internalFormat", _context, cfg, _context.LEQUAL),
                                sourceFormat : getGLOption("sourceType", _context, cfg, _context.ALPHA),
                                sourceType : getGLOption("sourceType", _context, cfg, _context.UNSIGNED_BYTE),
                                logging: SceneJS._loggingModule
                            });
                        } catch (e) {
                        }
                    });
            SceneJS._processModule.killProcess(process);
            onSuccess(textures[textureId]);
        };
        image.onerror = function() {
            SceneJS._processModule.killProcess(process);
            onError();
        };
        image.onabort = function() {
            SceneJS._processModule.killProcess(process);
            onAbort();
        };
        image.src = uri;  // Starts image load
        return image;
    };

    // @private
    this.pushLayer = function(texture, params) {
        if (!textures[texture.textureId]) {
            throw SceneJS._errorModule.fatalError("No such texture loaded \"" + texture.textureId + "\"");
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
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.TEXTURES_UPDATED, layerStack);
    };

    // @private
    this.popLayers = function(nLayers) {
        for (var i = 0; i < nLayers; i++) {
            layerStack.pop();
        }
        dirty = true;
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.TEXTURES_UPDATED, layerStack);
    };
})();