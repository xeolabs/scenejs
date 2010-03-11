/**
 *
 */
SceneJS._backends.installBackend(

        "texture",

        function(ctx) {

            var time = (new Date()).getTime();      // Current system time for LRU caching
            var canvas;                             // Currently active canvas
            var textures = {};                      // Texture cache
            var activeTexture;                      // Currently active texture
            var loaded = false;                     // True when certain that current texture is loaded

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED, // System time update
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED, // Scene traversal begun - texture not loaded
                    function() {
                        activeTexture = null;
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (!loaded && activeTexture) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.TEXTURE_EXPORTED,
                                    activeTexture
                                    );
                            loaded = true;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        loaded = false;
                    });

            /** Removes texture from shader (if canvas exists in DOM) and deregisters it from backend
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
             */
            function deleteTextures() {
                for (var textureId in textures) {
                    var texture = textures[textureId];
                    deleteTexture(texture);
                }
                textures = {};
                activeTexture = null;
                loaded = false;
            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET, // Framework reset - delete textures
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
            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time; // Doesn't evict textures that we have traversed into
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
                            ctx.logging.info("Evicting texture: " + id);
                            deleteTexture(evictee);
                            return true;
                        }
                        return false;   // Couldnt find suitable evictee
                    });

            /**
             * Translates a SceneJS param value to a WebGL enum value,
             * or to default if undefined. Throws exception when defined
             * but not mapped to an enum.
             */
            function getGLOption(value, defaultVal) {
                if (value == undefined) {
                    return defaultVal;
                }
                var glVal = SceneJS._webgl.enumMap[value];
                if (glVal == undefined) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Unrecognised texture node configuration value: '" + value + "'");
                }
                return glVal;
            }

            /** Returns default value for when given value is undefined
             */
            function getOption(value, defaultVal) {
                return (value == undefined) ? defaultVal : value;
            }

            return { // Node-facing API

                /** Returns the ID of the currently active texture
                 */
                getActiveTexture : function() {
                    return activeTexture ? activeTexture.textureId : null;
                },

                /** Looks for loaded texture, which may have been evicted after lack of recent use,
                 * in which case client texture node will have to recreate it.
                 */
                getTexture : function(textureId) {
                    return textures[textureId];
                },

                /**
                 * Starts a process to load a texture image.
                 *
                 * @param uri Image location
                 * @param onSuccess Callback returns image on success - client node than must kill process with imageLoaded
                 * @param onError Callback fired on failure
                 * @param onAbort Callback fired when load aborted, eg. user hits "stop" button in browser
                 */
                loadImage : function(uri, onSuccess, onError, onAbort) {
                    var process = ctx.processes.createProcess({
                        description:"Texture image load: " + uri
                    });
                    var image = new Image();
                    image.onload = function() {
                        onSuccess(image);
                    };
                    image.onerror = function() {
                        ctx.processes.destroyProcess(process);
                        onError();
                    };
                    image.onabort = function() {
                        ctx.processes.destroyProcess(process);
                        onAbort();
                    };
                    image.src = uri;  // Starts image load
                    return process;
                },

                /**
                 * Kills texture image load process.
                 */
                imageLoaded : function(process) {
                    ctx.processes.destroyProcess(process);
                },

                /**
                 * Creates new texture and returns its unique ID.
                 */
                createTexture : function(cfg) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var context = canvas.context;
                    var textureId = cfg.uri
                            ? (canvas.canvasId + ":" + cfg.uri)
                            : SceneJS._utils.createKeyForMap(textures, canvas.canvasId + ":texture");

                    ctx.memory.allocate(
                            "texture '" + textureId + "'",
                            function() {
                                textures[textureId] = new SceneJS._webgl.Texture2D(context, {
                                    textureId : textureId,
                                    canvas: canvas,
                                    image : cfg.image,
                                    texels :cfg.texels,
                                    minFilter : getGLOption(cfg.minFilter, context.LINEAR),
                                    magFilter :  getGLOption(cfg.magFilter, context.LINEAR),
                                    wrapS : getGLOption(cfg.wrapS, context.CLAMP_TO_EDGE),
                                    wrapT :   getGLOption(cfg.wrapT, context.CLAMP_TO_EDGE),
                                    isDepth :  getOption(cfg.isDepth, false),
                                    depthMode : getGLOption(cfg.depthMode, context.LUMINANCE),
                                    depthCompareMode : getGLOption(cfg.depthCompareMode, context.COMPARE_R_TO_TEXTURE),
                                    depthCompareFunc : getGLOption(cfg.depthCompareFunc, context.LEQUAL),
                                    flipY : getOption(cfg.flipY, true),
                                    width: getOption(cfg.width, 1),
                                    height: getOption(cfg.height, 1),
                                    internalFormat : getGLOption(cfg.internalFormat, context.LEQUAL),
                                    sourceFormat : getGLOption(cfg.sourceType, context.ALPHA),
                                    sourceType : getGLOption(cfg.sourceType, context.UNSIGNED_BYTE),
                                    logging: ctx.logging
                                });
                            });

                    return textureId;
                },

                /** Deactives the currently-active texture - does nothing if none active
                 *
                 */
                deactivateTexture: function() {
                    if (activeTexture) {
                        var texture = activeTexture;
                        activeTexture = null;
                        loaded = false;
                        ctx.events.fireEvent(SceneJS._eventTypes.TEXTURE_DEACTIVATED, texture);
                    }
                },

                /** Activates currently existing texture of given ID and bumps its last-used
                 * time.
                 */
                activateTexture : function(textureId) {
                    var texture = textures[textureId];
                    if (!texture) {
                        throw "No such texture loaded \"" + textureId + "\"";
                    }
                    activeTexture = texture;
                    activeTexture.lastUsed = time;
                    loaded = false;
                    ctx.events.fireEvent(SceneJS._eventTypes.TEXTURE_ACTIVATED, texture);
                }
            };
        });