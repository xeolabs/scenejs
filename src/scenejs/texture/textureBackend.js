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
 */
SceneJS._backends.installBackend(

        "texture",

        function(ctx) {

            var time = (new Date()).getTime();      // Current system time for LRU caching
            var canvas;
            var textures = {};
            var layerStack = [];
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        layerStack = [];
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.TEXTURES_EXPORTED,
                                    layerStack
                                    );
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
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
                layerStack = [];
                dirty = true;
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
            function getGLOption(name, context, cfg, defaultVal) {
                var value = cfg[name];
                if (value == undefined) {
                    return defaultVal;
                }
                var glName = SceneJS._webgl.enumMap[value];
                if (glName == undefined) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Unrecognised value for SceneJS.texture node property '" + name + "' value: '" + value + "'");
                }
                var glValue = context[glName];
                //                if (!glValue) {
                //                    throw new SceneJS.exceptions.WebGLUnsupportedNodeConfigException(
                //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
                //                }
                return glValue;
            }

            /** Returns default value for when given value is undefined
             */
            function getOption(value, defaultVal) {
                return (value == undefined) ? defaultVal : value;
            }

            return { // Node-facing API

                /** Verifies that texture still cached - it may have been evicted after lack of recent use,
                 * in which case client texture node will have to recreate it.
                 */
                textureExists : function(texture) {
                    return textures[texture.textureId];
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
                 * Creates and returns a new texture, or re-uses existing one if possible
                 */
                createTexture : function(image, cfg) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var context = canvas.context;
                    var textureId = SceneJS._utils.createKeyForMap(textures, canvas.canvasId + ":texture");

                    ctx.memory.allocate(
                            "texture '" + textureId + "'",
                            function() {
                                textures[textureId] = new SceneJS._webgl.Texture2D(context, {
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
                                    logging: ctx.logging
                                });
                            });

                    return textures[textureId];
                },

                pushLayer : function(texture, params) {
                    if (!textures[texture.textureId]) {
                        throw "No such texture loaded \"" + texture.textureId + "\"";
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
                    ctx.events.fireEvent(SceneJS._eventTypes.TEXTURES_UPDATED, layerStack);
                },

                popLayers : function(nLayers) {
                    for (var i = 0; i < nLayers; i++) {
                        layerStack.pop();
                    }
                    dirty = true;
                    ctx.events.fireEvent(SceneJS._eventTypes.TEXTURES_UPDATED, layerStack);
                }
            };
        });