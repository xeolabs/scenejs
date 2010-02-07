/**
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'texture';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                ctx.textures = (function() {
                    var textures = {
                    };
                    var activeTexture = null;
                    var loaded = false;

                    ctx.scenes.onEvent("scene-activated", function() {
                        activeTexture = null;
                        loaded = false;
                    });

                    /** When a new program is activated we will need to lazy-load our current texture
                     */
                    ctx.scenes.onEvent("program-activated", function() {
                        loaded = false;
                    });

                    /** When a program is deactivated we may need to re-load into the previously active program
                     */
                    ctx.scenes.onEvent("program-deactivated", function() {
                        loaded = false;
                    });
                    /**
                     * When geometry is about to draw we load our texture if not loaded already
                     */
                    ctx.scenes.onEvent("geo-drawing", function() {
                        if (!loaded && activeTexture) {
                            ctx.programs.bindTexture(activeTexture.ptexture);
                            loaded = true;
                        }
                    });


                    return {

                        getTexture : function(textureId) {
                            var texture = textures[textureId];
                            if (texture) {
                                texture.timeToLive--;
                                //    evict();
                                return textureId;
                            }
                            return null;
                        },

                        loadTexture: function(uri, onSuccess, onError, onAbort) {
                            var textureId = uri;
                            var image = new Image();
                            var texture = {
                                textureId:textureId,
                                image: image,
                                timeToLive : 1000
                            };
                            texture.image.onload = function() {
                                textures[textureId] = texture;
                                onSuccess(texture.textureId);
                            };
                            texture.image.onerror = onError;
                            texture.image.onabort = onAbort;
                            texture.image.src = uri;
                        },

                        bindTexture: function(textureId) {
                            var texture = textures[textureId];
                            var context = ctx.renderer.canvas.context;
                            texture.ptexture = context.createTexture();
                            texture.canvas = ctx.renderer.canvas;
                            texture.context = context;
                            context.bindTexture(context.TEXTURE_2D, texture.ptexture);
                            context.texImage2D(context.TEXTURE_2D, 0, texture.image);
                            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
                            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_NEAREST);
                            context.generateMipmap(context.TEXTURE_2D);
                            context.bindTexture(context.TEXTURE_2D, null);
                        },

                        activateTexture: function(textureId) {
                            var texture = textures[textureId];
                            if (!texture) {
                                throw "No such texture loaded \"" + textureId + "\"";
                            }
                            activeTexture = texture;
                            loaded = false;
                        },

                        getActiveTextureId: function() {
                            return activeTexture ? activeTexture.textureId : null;
                        },

                        deleteTextures : function() {
                            for (var textureId in textures) {
                                var texture = textures[textureId];
                                if (document.getElementById(texture.canvas.canvasId)) {  // Context can't exist if canvas not in DOM
                                    if (texture.context) {
                                        texture.context.deleteTexture(texture.ptexture);
                                    }
                                }
                            }
                            textures = {};
                            activeTexture = null;
                            loaded = false;
                        }
                    };
                })();
            };

            /** Looks for loaded texture, which may have been evicted after lack of recent use
             */
            this.getTexture = function(textureId) {
                return ctx.textures.getTexture(textureId);
            };

            /** Starts load of texture image in a new process and returns the ID of the process. When the
             * process later completes, either the given onSuccess or the onError will be called
             * depending on whether the load was successful ot not. On failure, the process will have been
             * be killed.  On success, the client texture node will have to then call textureLoaded to notify
             * the backend that the texture has loaded and allow backend to kill the process.
             */
            this.loadTexture = function(uri, onSuccess, onError, onAbort) {
                var process = ctx.scenes.createProcess({
                    description:"Texture load: " + uri
                });
                ctx.textures.loadTexture(uri,
                        onSuccess,
                        function() {  // onError
                            ctx.scenes.destroyProcess(process);
                            onError();
                        },
                        function() {  // onAbort
                            ctx.scenes.destroyProcess(process);
                            onAbort();
                        });
                return process;
            };

            /** Notifies backend that load has completed; backend then binds the texture and kills the process.
             */
            this.textureLoaded = function(process, textureId) {
                ctx.textures.bindTexture(textureId);
                ctx.scenes.destroyProcess(process);
            };

            /** Activates currently loaded texture of given ID
             */
            this.activateTexture = function(textureId) {
                ctx.textures.activateTexture(textureId);
            };

            this.reset = function() {
                ctx.textures.deleteTextures();
            };
        })());